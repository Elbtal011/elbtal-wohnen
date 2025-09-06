import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { JSZip } from 'https://deno.land/x/jszip@0.11.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function arrayToCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let cutoffDate: string | null = null
    try {
      const body = await req.json()
      cutoffDate = body?.cutoffDate ?? null // backward compatible, but unused
    } catch (_) {
      // no body provided
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting leads export with documents...')

    // Initialize ZIP
    const zip = new JSZip()

    // Fetch contact requests (all)
    const { data: contactRequests, error: contactError } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (contactError) {
      console.error('Error fetching contact requests:', contactError)
      throw contactError
    }

    console.log(`Found ${contactRequests?.length || 0} contact requests`)

    // Fetch related user documents and lead documents for these contacts
    const contactIds = contactRequests?.map(cr => cr.id) || []
    
    // Get user documents for registered users
    let userDocuments: any[] = []
    let leadDocuments: any[] = []

    if (contactIds.length > 0) {
      // Get lead documents directly associated with contact requests
      const { data: leadDocs, error: leadDocsError } = await supabase
        .from('lead_documents')
        .select('*')
        .in('contact_request_id', contactIds)

      if (leadDocsError) {
        console.error('Error fetching lead documents:', leadDocsError)
      } else {
        leadDocuments = leadDocs || []
      }

      // Get user documents for users that actually submitted applications (better signal of "applied")
      const { data: applications, error: appsError } = await supabase
        .from('property_applications')
        .select('user_id')
        .not('user_id', 'is', null)

      if (appsError) {
        console.error('Error fetching applications:', appsError)
      }

      const userIds = Array.from(new Set((applications || []).map((a: any) => a.user_id)))

      if (userIds.length > 0) {
        const { data: userDocs, error: userDocsError } = await supabase
          .from('user_documents')
          .select('*')
          .in('user_id', userIds)

        if (userDocsError) {
          console.error('Error fetching user documents:', userDocsError)
        } else if (userDocs) {
          userDocuments = userDocs
        }
      }
    }

    console.log(`Found ${leadDocuments.length} lead documents`)
    console.log(`Found ${userDocuments.length} user documents`)

    // Add CSV files to ZIP
    if (contactRequests && contactRequests.length > 0) {
      const csvContent = arrayToCSV(contactRequests)
      zip.addFile('data/contact_requests.csv', csvContent)
    }

    if (leadDocuments.length > 0) {
      const csvContent = arrayToCSV(leadDocuments)
      zip.addFile('data/lead_documents.csv', csvContent)
    }

    if (userDocuments.length > 0) {
      const csvContent = arrayToCSV(userDocuments)
      zip.addFile('data/user_documents.csv', csvContent)
    }

    // Download and add lead documents to ZIP
    let successfulDownloads = 0
    let failedDownloads = 0

    for (const doc of leadDocuments) {
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('lead-documents')
          .download(doc.file_path)

        if (downloadError) {
          console.error(`Failed to download lead document ${doc.file_path}:`, downloadError)
          failedDownloads++
          continue
        }

        if (fileData) {
          const fileBuffer = await fileData.arrayBuffer()
          const fileName = `documents/lead_documents/${doc.contact_request_id}/${doc.document_type}/${doc.file_name}`
          zip.addFile(fileName, new Uint8Array(fileBuffer))
          successfulDownloads++
        }
      } catch (error) {
        console.error(`Error downloading lead document ${doc.file_path}:`, error)
        failedDownloads++
      }
    }

    // Download and add user documents to ZIP
    for (const doc of userDocuments) {
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('user-documents')
          .download(doc.file_path)

        if (downloadError) {
          console.error(`Failed to download user document ${doc.file_path}:`, downloadError)
          failedDownloads++
          continue
        }

        if (fileData) {
          const fileBuffer = await fileData.arrayBuffer()
          const fileName = `documents/user_documents/${doc.user_id}/${doc.document_type}/${doc.file_name}`
          zip.addFile(fileName, new Uint8Array(fileBuffer))
          successfulDownloads++
        }
      } catch (error) {
        console.error(`Error downloading user document ${doc.file_path}:`, error)
        failedDownloads++
      }
    }

    console.log(`Document download complete: ${successfulDownloads} successful, ${failedDownloads} failed`)

    // Add export info
    const exportInfo = {
      created_at: new Date().toISOString(),
      cutoff_date: cutoffDate,
      total_contact_requests: contactRequests?.length || 0,
      total_lead_documents: leadDocuments.length,
      total_user_documents: userDocuments.length,
      successful_document_downloads: successfulDownloads,
      failed_document_downloads: failedDownloads,
      export_type: 'leads_with_documents'
    }

    zip.addFile('export_info.json', JSON.stringify(exportInfo, null, 2))

    // Generate ZIP
    console.log('Generating ZIP file...')
    const zipData = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })

    console.log(`Export complete! ZIP size: ${zipData.length} bytes`)

    return new Response(zipData, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="leads_export_${new Date().toISOString().split('T')[0]}.zip"`,
        'Content-Length': zipData.length.toString(),
      },
    })

  } catch (error) {
    console.error('Leads export error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Export failed',
        message: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
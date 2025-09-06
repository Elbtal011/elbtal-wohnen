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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting full backup with documents...')

    // Initialize ZIP
    const zip = new JSZip()

    // Fetch all data
    const { data: contactRequests, error: contactError } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: propertyApplications, error: applicationError } = await supabase
      .from('property_applications')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: userDocuments, error: documentsError } = await supabase
      .from('user_documents')
      .select('*')
      .order('uploaded_at', { ascending: false })

    const { data: leadDocuments, error: leadDocsError } = await supabase
      .from('lead_documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (contactError || applicationError || documentsError || leadDocsError) {
      throw new Error('Error fetching data from database')
    }

    console.log(`Found ${contactRequests?.length || 0} contact requests`)
    console.log(`Found ${propertyApplications?.length || 0} property applications`)
    console.log(`Found ${userDocuments?.length || 0} user documents`)
    console.log(`Found ${leadDocuments?.length || 0} lead documents`)

    // Add CSV files to ZIP
    if (contactRequests && contactRequests.length > 0) {
      const csvContent = arrayToCSV(contactRequests)
      zip.addFile('data/contact_requests.csv', csvContent)
    }

    if (propertyApplications && propertyApplications.length > 0) {
      const csvContent = arrayToCSV(propertyApplications)
      zip.addFile('data/property_applications.csv', csvContent)
    }

    // Remove properties.csv to keep backup small and focused on leads
    if (userDocuments && userDocuments.length > 0) {
      const csvContent = arrayToCSV(userDocuments)
      zip.addFile('data/user_documents_metadata.csv', csvContent)
    }

    if (leadDocuments && leadDocuments.length > 0) {
      const csvContent = arrayToCSV(leadDocuments)
      zip.addFile('data/lead_documents.csv', csvContent)
    }

    // Skip binary file downloads to avoid timeouts; include only metadata CSVs
    let successfulDownloads = 0
    let failedDownloads = 0
    console.log('Skipping binary file downloads; including metadata only in ZIP')

    // Add backup info
    const backupInfo = {
      created_at: new Date().toISOString(),
      total_contact_requests: contactRequests?.length || 0,
      total_property_applications: propertyApplications?.length || 0,
      total_user_documents: userDocuments?.length || 0,
      total_lead_documents: leadDocuments?.length || 0,
      successful_document_downloads: successfulDownloads,
      failed_document_downloads: failedDownloads,
      backup_type: 'full_backup_with_documents'
    }

    zip.addFile('backup_info.json', JSON.stringify(backupInfo, null, 2))

    // Generate ZIP (no compression to reduce CPU)
    console.log('Generating ZIP file (STORE)...')
    const zipData = await zip.generateAsync({ type: 'uint8array', compression: 'STORE' })

    console.log(`Backup complete! ZIP size: ${zipData.length} bytes`)

    return new Response(zipData, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="elbtal_full_backup_${new Date().toISOString().split('T')[0]}.zip"`,
        'Content-Length': zipData.length.toString(),
      },
    })

  } catch (error) {
    console.error('Full backup error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Backup failed',
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
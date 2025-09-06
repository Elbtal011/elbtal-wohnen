import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportResult {
  success: boolean
  message: string
  details: {
    contactRequests: { inserted: number; updated: number; skipped: number }
    leadDocuments: { inserted: number; updated: number; skipped: number }
    userDocuments: { inserted: number; updated: number; skipped: number }
    files: { uploaded: number; failed: number; skipped: number }
  }
  errors: string[]
}

function parseCSV(csvContent: string): any[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
  const data: any[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => {
      let value = v.replace(/"/g, '')
      if (value === '') return null
      if (!isNaN(Number(value))) return Number(value)
      if (value === 'true') return true
      if (value === 'false') return false
      return value
    })
    
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })
    data.push(row)
  }
  
  return data
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const zipFile = formData.get('zipFile') as File
    
    if (!zipFile) {
      throw new Error('No ZIP file provided')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting leads import with documents...')

    const result: ImportResult = {
      success: false,
      message: '',
      details: {
        contactRequests: { inserted: 0, updated: 0, skipped: 0 },
        leadDocuments: { inserted: 0, updated: 0, skipped: 0 },
        userDocuments: { inserted: 0, updated: 0, skipped: 0 },
        files: { uploaded: 0, failed: 0, skipped: 0 }
      },
      errors: []
    }

    // Read ZIP file
    const zipBuffer = await zipFile.arrayBuffer()
    
    // For now, we'll use a simple approach - extract files manually
    // In a production environment, you'd use a proper ZIP library
    
    // Parse form data to get CSV content and file information
    // This is a simplified approach - in production you'd extract the ZIP properly
    const contactRequestsCSV = formData.get('contactRequestsCSV') as string
    const leadDocumentsCSV = formData.get('leadDocumentsCSV') as string
    const userDocumentsCSV = formData.get('userDocumentsCSV') as string
    
    if (!contactRequestsCSV) {
      throw new Error('No contact requests data found in import')
    }

    // Parse CSV data
    const contactRequests = parseCSV(contactRequestsCSV)
    const leadDocuments = leadDocumentsCSV ? parseCSV(leadDocumentsCSV) : []
    const userDocuments = userDocumentsCSV ? parseCSV(userDocumentsCSV) : []

    console.log(`Importing ${contactRequests.length} contact requests`)
    console.log(`Importing ${leadDocuments.length} lead documents`)
    console.log(`Importing ${userDocuments.length} user documents`)

    // Import contact requests
    for (const contact of contactRequests) {
      try {
        // Check if contact already exists
        const { data: existing } = await supabase
          .from('contact_requests')
          .select('id')
          .eq('id', contact.id)
          .single()

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('contact_requests')
            .update(contact)
            .eq('id', contact.id)

          if (error) {
            result.errors.push(`Failed to update contact ${contact.id}: ${error.message}`)
            result.details.contactRequests.skipped++
          } else {
            result.details.contactRequests.updated++
          }
        } else {
          // Insert new
          const { error } = await supabase
            .from('contact_requests')
            .insert(contact)

          if (error) {
            result.errors.push(`Failed to insert contact ${contact.id}: ${error.message}`)
            result.details.contactRequests.skipped++
          } else {
            result.details.contactRequests.inserted++
          }
        }
      } catch (error) {
        result.errors.push(`Error processing contact ${contact.id}: ${error.message}`)
        result.details.contactRequests.skipped++
      }
    }

    // Import lead documents metadata
    for (const doc of leadDocuments) {
      try {
        // Check if document already exists
        const { data: existing } = await supabase
          .from('lead_documents')
          .select('id')
          .eq('id', doc.id)
          .single()

        if (existing) {
          result.details.leadDocuments.skipped++
        } else {
          // Insert new document record
          const { error } = await supabase
            .from('lead_documents')
            .insert(doc)

          if (error) {
            result.errors.push(`Failed to insert lead document ${doc.id}: ${error.message}`)
            result.details.leadDocuments.skipped++
          } else {
            result.details.leadDocuments.inserted++
          }
        }
      } catch (error) {
        result.errors.push(`Error processing lead document ${doc.id}: ${error.message}`)
        result.details.leadDocuments.skipped++
      }
    }

    // Import user documents metadata
    for (const doc of userDocuments) {
      try {
        // Check if document already exists
        const { data: existing } = await supabase
          .from('user_documents')
          .select('id')
          .eq('id', doc.id)
          .single()

        if (existing) {
          result.details.userDocuments.skipped++
        } else {
          // Insert new document record
          const { error } = await supabase
            .from('user_documents')
            .insert(doc)

          if (error) {
            result.errors.push(`Failed to insert user document ${doc.id}: ${error.message}`)
            result.details.userDocuments.skipped++
          } else {
            result.details.userDocuments.inserted++
          }
        }
      } catch (error) {
        result.errors.push(`Error processing user document ${doc.id}: ${error.message}`)
        result.details.userDocuments.skipped++
      }
    }

    // TODO: Extract and upload actual files from ZIP
    // This would require proper ZIP extraction and file upload to Supabase Storage
    // For now, we'll just import the metadata

    result.success = true
    result.message = `Import completed: ${result.details.contactRequests.inserted + result.details.contactRequests.updated} contacts, ${result.details.leadDocuments.inserted} lead docs, ${result.details.userDocuments.inserted} user docs`

    console.log('Import completed:', result)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Import error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Import failed',
        error: error.message
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
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { JSZip } from 'https://deno.land/x/jszip@0.11.0/mod.ts'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  // Robust CSV parser supporting quoted fields and commas/newlines inside quotes
  const text = csvContent && csvContent.charCodeAt(0) === 65279 ? csvContent.slice(1) : csvContent
  const rows: string[][] = []
  const line: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        // Escaped quote
        if (i + 1 < csvContent.length && csvContent[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        line.push(cur)
        cur = ''
      } else if (ch === '\n' || ch === '\r') {
        if (cur !== '' || line.length) {
          line.push(cur)
          rows.push([...line])
          line.length = 0
          cur = ''
        }
        // consume \r\n pairs
        if (ch === '\r' && i + 1 < csvContent.length && csvContent[i + 1] === '\n') i++
      } else {
        cur += ch
      }
    }
  }
  if (cur !== '' || line.length) {
    line.push(cur)
    rows.push([...line])
  }
  if (rows.length === 0) return []
  const headers = rows[0].map(h => h.trim())
  const dataRows = rows.slice(1)
  const toValue = (value: string) => {
    if (value === '') return null
    return value
  }
  return dataRows.map(cols => {
    const obj: any = {}
    headers.forEach((h, idx) => { obj[h] = toValue(cols[idx] ?? '') })
    return obj
  })
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
    console.log(`ZIP received, size: ${zipBuffer.byteLength} bytes`)

    // Load and extract CSVs from ZIP using JSZip (deno wrapper requires instance)
    const zip = new JSZip()
    await zip.loadAsync(new Uint8Array(zipBuffer))
    const fileNames = Object.keys(zip.files())
    console.log('ZIP contains files:', fileNames.slice(0, 50))

    const readText = async (paths: string[]): Promise<string | null> => {
      for (const p of paths) {
        const file = zip.file(p)
        if (file) return await file.async('string')
      }
      return null
    }

    let contactRequestsCSV = await readText(['data/contact_requests.csv', 'contact_requests.csv'])
    let leadDocumentsCSV = await readText(['data/lead_documents.csv', 'lead_documents.csv'])
    let userDocumentsCSV = await readText([
      'data/user_documents_metadata.csv',
      'data/user_documents.csv',
      'user_documents_metadata.csv',
      'user_documents.csv'
    ])

    // Backward-compatibility: also accept CSVs provided directly in form-data
    if (!contactRequestsCSV) {
      const f = formData.get('contactRequestsCSV')
      if (typeof f === 'string' && f.trim().length > 0) contactRequestsCSV = f
    }
    if (!leadDocumentsCSV) {
      const f = formData.get('leadDocumentsCSV')
      if (typeof f === 'string' && f.trim().length > 0) leadDocumentsCSV = f
    }
    if (!userDocumentsCSV) {
      const f = formData.get('userDocumentsCSV')
      if (typeof f === 'string' && f.trim().length > 0) userDocumentsCSV = f
    }

    if (!contactRequestsCSV) {
      throw new Error('No contact requests CSV found (expected data/contact_requests.csv in ZIP)')
    }

    // Parse CSV data
    const contactRequests = parseCSV(contactRequestsCSV)
    const leadDocuments = leadDocumentsCSV ? parseCSV(leadDocumentsCSV) : []
    const userDocuments = userDocumentsCSV ? parseCSV(userDocumentsCSV) : []

    console.log(`Importing ${contactRequests.length} contact requests`)
    console.log(`Importing ${leadDocuments.length} lead documents`)
    console.log(`Importing ${userDocuments.length} user documents`)

    // Import contact requests (bulk upsert to avoid per-row queries and RLS pitfalls)
    const chunkArray = (arr: any[], size: number) => {
      const out: any[] = []
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
      return out
    }

    for (const part of chunkArray(contactRequests, 500)) {
      const { error } = await supabase
        .from('contact_requests')
        .upsert(part, { onConflict: 'id' })

      if (error) {
        result.errors.push(`Failed to upsert ${part.length} contact requests: ${error.message}`)
        result.details.contactRequests.skipped += part.length
      } else {
        result.details.contactRequests.inserted += part.length
      }
    }

    // Import lead documents metadata (bulk upsert)
    for (const part of chunkArray(leadDocuments, 500)) {
      const normalized = part.map((d: any) => ({
        ...d,
        file_size: d.file_size === '' || d.file_size === null || d.file_size === undefined ? null : Number(d.file_size)
      }))

      const { error } = await supabase
        .from('lead_documents')
        .upsert(normalized, { onConflict: 'id' })

      if (error) {
        result.errors.push(`Failed to upsert ${part.length} lead documents: ${error.message}`)
        result.details.leadDocuments.skipped += part.length
      } else {
        result.details.leadDocuments.inserted += part.length
      }
    }

    // Import user documents metadata (bulk upsert)
    for (const part of chunkArray(userDocuments, 500)) {
      const normalized = part.map((d: any) => ({
        ...d,
        file_size: d.file_size === '' || d.file_size === null || d.file_size === undefined ? null : Number(d.file_size)
      }))

      const { error } = await supabase
        .from('user_documents')
        .upsert(normalized, { onConflict: 'id' })

      if (error) {
        result.errors.push(`Failed to upsert ${part.length} user documents: ${error.message}`)
        result.details.userDocuments.skipped += part.length
      } else {
        result.details.userDocuments.inserted += part.length
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
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
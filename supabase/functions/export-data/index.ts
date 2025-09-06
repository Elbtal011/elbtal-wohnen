import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactRequest {
  id: string
  created_at: string
  property_id?: string
  anrede?: string
  vorname: string
  nachname: string
  email: string
  telefon: string
  strasse?: string
  nummer?: string
  plz?: string
  ort?: string
  nachricht: string
  status?: string
  lead_label?: string
  lead_stage?: string
}

interface PropertyApplication {
  id: string
  created_at: string
  user_id?: string
  property_id?: string
  vorname: string
  nachname: string
  email: string
  telefon: string
  adresse: string
  postleitzahl: string
  ort: string
  geburtsdatum: string
  geburtsort: string
  staatsangehoerigkeit: string
  nettoeinkommen: number
  einzugsdatum: string
  nachricht: string
  status: string
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

    console.log('Starting data export...')

    // Fetch contact requests
    const { data: contactRequests, error: contactError } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (contactError) {
      console.error('Error fetching contact requests:', contactError)
      throw contactError
    }

    // Fetch property applications
    const { data: propertyApplications, error: applicationError } = await supabase
      .from('property_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (applicationError) {
      console.error('Error fetching property applications:', applicationError)
      throw applicationError
    }

    console.log(`Found ${contactRequests?.length || 0} contact requests`)
    console.log(`Found ${propertyApplications?.length || 0} property applications`)

    // Convert to CSV
    const contactRequestsCSV = arrayToCSV(contactRequests || [])
    const propertyApplicationsCSV = arrayToCSV(propertyApplications || [])

    // Create a combined export with both datasets
    const exportData = {
      timestamp: new Date().toISOString(),
      contact_requests: {
        count: contactRequests?.length || 0,
        csv: contactRequestsCSV
      },
      property_applications: {
        count: propertyApplications?.length || 0,
        csv: propertyApplicationsCSV
      }
    }

    console.log('Export completed successfully')

    return new Response(JSON.stringify(exportData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    
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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from "npm:resend@4.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY') || '')

// Email sending via Resend with proper headers
async function sendEmail(to: string, subject: string, htmlContent: string, isAdminEmail = false) {
  const rawFrom = Deno.env.get('SMTP_FROM') || Deno.env.get('FROM_EMAIL') || ''
  const defaultFrom = 'info@amiel-immobilienverwaltung.de'
  const fromEmail = rawFrom.includes('@') ? rawFrom : defaultFrom
  const apiKeyPresent = !!Deno.env.get('RESEND_API_KEY')

  if (!apiKeyPresent) {
    console.error('Email service not configured: missing RESEND_API_KEY')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@amiel-immobilienverwaltung.de>`
    const date = new Date().toUTCString()
    const replyTo = isAdminEmail ? fromEmail : 'info@amiel-immobilienverwaltung.de'
    console.log('Resend email payload meta', { to, fromEmail, subject, isAdminEmail })

    const response = await resend.emails.send({
      from: `Amiel Immobilienverwaltung <${fromEmail}>`,
      to: [to],
      subject,
      html: htmlContent,
      reply_to: replyTo,
      headers: {
        'X-Mailer': 'Amiel Contact System v1.0',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Date': date,
        'Message-ID': messageId,
      },
    })

    console.log('Resend send response:', response)
    return { success: true }
  } catch (error) {
    console.error('Resend Error:', error)
    return { success: false, error: (error as Error).message }
  }
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.json()

    // Insert contact request into database
    const { data: request, error } = await supabase
      .from('contact_requests')
      .insert([{
        property_id: formData.propertyId || null,
        anrede: formData.anrede,
        vorname: formData.vorname,
        nachname: formData.nachname,
        email: formData.email,
        telefon: formData.telefon,
        strasse: formData.strasse,
        nummer: formData.nummer,
        plz: formData.plz,
        ort: formData.ort,
        nachricht: formData.nachricht,
        status: 'new'
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Contact request created:', request.id)

    // Send admin notification email
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'info@amiel-immobilienverwaltung.de'
    const propertyInfo = formData.propertyId ? `<p><strong>Immobilie ID:</strong> ${formData.propertyId}</p>` : ''
    
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Neue Kontaktanfrage</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Kontaktdaten:</h3>
          <p><strong>Anrede:</strong> ${formData.anrede || 'Nicht angegeben'}</p>
          <p><strong>Name:</strong> ${formData.vorname} ${formData.nachname}</p>
          <p><strong>E-Mail:</strong> ${formData.email}</p>
          <p><strong>Telefon:</strong> ${formData.telefon}</p>
          
          <h3>Adresse:</h3>
          <p><strong>Straße:</strong> ${formData.strasse || 'Nicht angegeben'} ${formData.nummer || ''}</p>
          <p><strong>PLZ/Ort:</strong> ${formData.plz || 'Nicht angegeben'} ${formData.ort || 'Nicht angegeben'}</p>
          
          ${propertyInfo}
          
          <h3>Nachricht:</h3>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">${formData.nachricht}</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Anfrage eingegangen am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}
          </p>
        </div>
      </div>
    `

    // Send user confirmation email
    const userEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Vielen Dank für Ihre Anfrage</h2>
        <p>Liebe/r ${formData.vorname} ${formData.nachname},</p>
        
        <p>vielen Dank für Ihre Kontaktanfrage. Wir haben Ihre Nachricht erfolgreich erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Ihre Anfrage im Überblick:</h3>
          <p><strong>Ihre E-Mail:</strong> ${formData.email}</p>
          <p><strong>Ihre Telefonnummer:</strong> ${formData.telefon}</p>
          ${propertyInfo}
          <p><strong>Ihre Nachricht:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">${formData.nachricht}</p>
        </div>
        
        <p>Für Rückfragen stehen wir Ihnen gerne zur Verfügung:</p>
        <p>
          <strong>Amiel Immobilienverwaltung</strong><br>
          E-Mail: info@amiel-immobilienverwaltung.de<br>
          Telefon: <a href="tel:+4915778749754">+49 157 78749754</a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
        </p>
      </div>
    `

    // Send emails (don't block response on email sending)
    const emailPromises = [
      sendEmail(adminEmail, 'Neue Kontaktanfrage - Amiel Immobilienverwaltung', adminEmailContent, true),
      sendEmail(formData.email, 'Bestätigung Ihrer Anfrage - Amiel Immobilienverwaltung', userEmailContent, false)
    ]

    // Send emails in background
    Promise.all(emailPromises).then(results => {
      console.log('Email results:', results)
    }).catch(error => {
      console.error('Email sending error:', error)
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Ihre Anfrage wurde erfolgreich übermittelt. Sie erhalten in Kürze eine Bestätigungs-E-Mail.',
        requestId: request.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es erneut.',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
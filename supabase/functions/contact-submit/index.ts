import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// SMTP Email sending function with proper headers
async function sendEmail(to: string, subject: string, htmlContent: string, isAdminEmail = false) {
  const smtpHost = Deno.env.get('SMTP_HOST')
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
  const smtpUsername = Deno.env.get('SMTP_USERNAME')
  const smtpPassword = Deno.env.get('SMTP_PASSWORD')
  const fromEmail = Deno.env.get('FROM_EMAIL')
  
  if (!smtpHost || !smtpUsername || !smtpPassword || !fromEmail) {
    console.error('SMTP configuration missing')
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    // Create a TCP connection to the SMTP server
    const conn = await Deno.connect({
      hostname: smtpHost,
      port: smtpPort,
    })

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Helper function to send SMTP command
    const sendCommand = async (command: string) => {
      await conn.write(encoder.encode(command + '\r\n'))
      const buffer = new Uint8Array(1024)
      const bytesRead = await conn.read(buffer)
      if (bytesRead) {
        return decoder.decode(buffer.subarray(0, bytesRead))
      }
      return ''
    }

    // SMTP conversation
    await sendCommand('') // Read initial greeting
    await sendCommand('EHLO localhost')
    await sendCommand('STARTTLS')
    
    // Note: For production, you'd need to handle TLS upgrade here
    // For now, we'll use basic authentication
    
    await sendCommand('AUTH LOGIN')
    await sendCommand(btoa(smtpUsername))
    await sendCommand(btoa(smtpPassword))
    
    await sendCommand(`MAIL FROM:<${fromEmail}>`)
    await sendCommand(`RCPT TO:<${to}>`)
    await sendCommand('DATA')
    
    // Generate proper email headers
    const messageId = `<${Date.now()}.${Math.random().toString(36)}@amiel-immobilienverwaltung.de>`
    const date = new Date().toUTCString()
    const replyTo = isAdminEmail ? fromEmail : 'info@amiel-immobilienverwaltung.de'
    
    const emailHeaders = [
      `Message-ID: ${messageId}`,
      `Date: ${date}`,
      `From: Amiel Immobilienverwaltung <${fromEmail}>`,
      `To: ${to}`,
      `Reply-To: ${replyTo}`,
      `Return-Path: <${fromEmail}>`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      `X-Mailer: Amiel Contact System v1.0`,
      `X-Priority: 3`,
      `X-MSMail-Priority: Normal`,
      '',
      htmlContent,
      '.'
    ].join('\r\n')
    
    await conn.write(encoder.encode(emailHeaders + '\r\n'))
    await sendCommand('QUIT')
    conn.close()
    
    return { success: true }
  } catch (error) {
    console.error('SMTP Error:', error)
    return { success: false, error: error.message }
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
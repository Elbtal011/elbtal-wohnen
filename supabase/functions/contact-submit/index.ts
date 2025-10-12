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

    // Extract additional fields either from payload or from the message text
    const msgText: string = typeof formData.nachricht === 'string' ? formData.nachricht : ''
    const extract = (label: string) => {
      const re = new RegExp(`${label}\\s*:\\s*(.+)`, 'i')
      const m = msgText.match(re)
      return m ? m[1].trim() : ''
    }

    const geburtsort = formData.geburtsort || extract('Geburtsort')
    const staatsangehoerigkeit = formData.staatsangehoerigkeit || extract('Staatsangehörigkeit')
    const geburtsdatum = formData.geburtsdatum || extract('Geburtsdatum')
    const einzugsdatum = formData.einzugsdatum || extract('Einzugsdatum')
    const nettoeinkommen = formData.nettoeinkommen || extract('Nettoeinkommen')
    const beruf = formData.beruf || extract('Beruf')
    const arbeitgeber = formData.arbeitgeber || extract('Arbeitgeber')
    
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
          
          ${(geburtsort || staatsangehoerigkeit || geburtsdatum || einzugsdatum || nettoeinkommen || beruf || arbeitgeber) ? `<h3>Zusätzliche Informationen:</h3>` : ''}
          ${geburtsort ? `<p><strong>Geburtsort:</strong> ${geburtsort}</p>` : ''}
          ${staatsangehoerigkeit ? `<p><strong>Staatsangehörigkeit:</strong> ${staatsangehoerigkeit}</p>` : ''}
          ${geburtsdatum ? `<p><strong>Geburtsdatum:</strong> ${geburtsdatum}</p>` : ''}
          ${nettoeinkommen ? `<p><strong>Nettoeinkommen:</strong> ${nettoeinkommen}</p>` : ''}
          ${einzugsdatum ? `<p><strong>Gewünschtes Einzugsdatum:</strong> ${einzugsdatum}</p>` : ''}
          ${beruf ? `<p><strong>Beruf:</strong> ${beruf}</p>` : ''}
          ${arbeitgeber ? `<p><strong>Arbeitgeber:</strong> ${arbeitgeber}</p>` : ''}
          
          ${propertyInfo}
          
          <h3>Nachricht:</h3>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">${formData.nachricht}</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Anfrage eingegangen am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}
          </p>
        </div>
      </div>
    `

    // Determine email content based on form source
    const formSource = formData.formSource || 'contact_page'
    const isPropertyInquiry = formSource === 'property_details'
    
    const userEmailContent = isPropertyInquiry ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="padding: 30px; background: #ffffff;">
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            Sehr geehrte/r ${formData.vorname} ${formData.nachname},
          </p>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            Ihre Anfrage ist bei uns eingetroffen.
          </p>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            Damit wir Ihre Unterlagen vollständig prüfen und den Bewerbungsprozess reibungslos gestalten können, 
            bitten wir Sie, sich in unserem Kundenportal zu registrieren:
          </p>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            <a href="https://amiel-immobilienverwaltung.de/auth" style="color: #2563eb; text-decoration: underline;">
              Hier zur Registrierung klicken
            </a>
          </p>
          
          <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.5;">
            Nach erfolgreicher Registrierung laden Sie bitte die folgenden Unterlagen hoch:
          </p>
          
          <ul style="margin: 0 0 20px 20px; font-size: 16px; line-height: 1.8;">
            <li>Gehaltsnachweise der letzten 3 Monate</li>
            <li>Kontoauszüge der letzten 3 Monate</li>
            <li>Kopie Ihres gültigen Ausweises (Vorder- und Rückseite)</li>
          </ul>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            Da die Wohnungen auf große Nachfrage stoßen, empfehlen wir, die Unterlagen zeitnah hochzuladen.
          </p>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            Wir danken Ihnen für Ihre Mithilfe und freuen uns auf die weitere Bearbeitung Ihrer Anfrage.
          </p>
          
          <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
            Mit freundlichen Grüßen<br>
            Amiel Immobilienverwaltung
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-top: 1px solid #e9ecef; font-size: 14px; line-height: 1.4; color: #666;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">
            Amiel Immobilienverwaltung GmbH
          </p>
          
          <p style="margin: 15px 0; color: #333;">
            Leuchtenbergring 54<br>
            81677 München<br>
            Telefon: +49 89 123 456 789<br>
            E-Mail: info@amiel-immobilienverwaltung.de
          </p>
          
          <p style="margin: 15px 0; font-size: 12px;">
            Handelsregister: Amtsgericht München, HRB 90221<br>
            USt-IdNr.: DE9741089
          </p>
          
          <p style="margin: 15px 0 0 0; font-size: 12px; font-style: italic;">
            Hinweis: Diese E-Mail und alle Anhänge sind vertraulich und ausschließlich für den bezeichneten Adressaten bestimmt.
          </p>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="padding: 30px; background: #ffffff;">
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            Sehr geehrte Damen und Herren,
          </p>
          
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich mit Ihnen in Verbindung setzen.
          </p>
          
          <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
            Mit freundlichen Grüßen<br>
            Amiel Immobilienverwaltung
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-top: 1px solid #e9ecef; font-size: 14px; line-height: 1.4; color: #666;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">
            Mit freundlichen Grüßen<br>
            Amiel Immobilienverwaltung
          </p>
          
          <p style="margin: 15px 0; color: #333;">
            <strong>Amiel Immobilienverwaltung GmbH</strong><br>
            Leuchtenbergring 54<br>
            81677 München<br>
            Telefon: +49 89 123 456 789<br>
            E-Mail: info@amiel-immobilienverwaltung.de
          </p>
          
          <p style="margin: 15px 0; font-size: 12px;">
            Handelsregister: Amtsgericht München, HRB 90221<br>
            USt-IdNr.: DE9741089
          </p>
          
          <p style="margin: 15px 0 0 0; font-size: 12px; font-style: italic;">
            Hinweis: Diese E-Mail und alle Anhänge sind vertraulich und ausschließlich für den bezeichneten Adressaten bestimmt.
          </p>
        </div>
      </div>
    `

    // Send emails (don't block response on email sending)
    const emailPromises = [
      sendEmail(adminEmail, 'Neue Kontaktanfrage - Amiel Immobilienverwaltung', adminEmailContent, true),
      sendEmail(formData.email, 'Vielen Dank für Ihre Anfrage', userEmailContent, false)
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
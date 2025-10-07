import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0?target=deno';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ApplicationNotificationRequest {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  propertyTitle: string;
  propertyAddress: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== APPLICATION NOTIFICATION FUNCTION START ===");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { applicationId, applicantName, applicantEmail, propertyTitle, propertyAddress }: ApplicationNotificationRequest = await req.json();

    console.log("Sending application notification for:", { applicationId, applicantName, propertyTitle });

    // Send notification email to admin
    const emailResponse = await resend.emails.send({
      from: "JK IMMOBILIEN <noreply@jk-immobilien.de>",
      to: ["info@jk-immobilien.de"],
      subject: `Neue Wohnungsbewerbung - ${propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Neue Wohnungsbewerbung eingegangen
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Immobilie Details:</h3>
            <p><strong>Objekt:</strong> ${propertyTitle}</p>
            <p><strong>Adresse:</strong> ${propertyAddress}</p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Bewerber Details:</h3>
            <p><strong>Name:</strong> ${applicantName}</p>
            <p><strong>E-Mail:</strong> ${applicantEmail}</p>
            <p><strong>Bewerbungs-ID:</strong> ${applicationId}</p>
          </div>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #dcfce7; border-left: 4px solid #16a34a; border-radius: 4px;">
            <p style="margin: 0; color: #166534;">
              <strong>Nächste Schritte:</strong><br>
              Loggen Sie sich in das Admin-Dashboard ein, um die vollständige Bewerbung zu überprüfen und den Bewerber zu kontaktieren.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            Diese E-Mail wurde automatisch vom Bewerbungssystem von JK IMMOBILIEN gesendet.<br>
            Zeitpunkt: ${new Date().toLocaleString('de-DE', { 
              timeZone: 'Europe/Berlin',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      `,
    });

    console.log("Notification email sent successfully:", emailResponse);

    // Log the notification in audit_log
    await supabase
      .from('audit_log')
      .insert({
        table_name: 'property_applications',
        operation: 'EMAIL_NOTIFICATION_SENT',
        details: {
          application_id: applicationId,
          recipient: 'info@jk-immobilien.de',
          applicant_name: applicantName,
          property_title: propertyTitle,
          email_id: emailResponse.data?.id,
          sent_at: new Date().toISOString()
        }
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Application notification sent successfully',
      email_id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-application-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send notification' 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
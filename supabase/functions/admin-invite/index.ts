import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

interface InviteRequest {
  email: string;
  role: 'admin' | 'employee';
  token: string;
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateUsername(email: string): string {
  const emailPart = email.split('@')[0].toLowerCase();
  const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${emailPart}${randomSuffix}`;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ADMIN INVITE FUNCTION START ===');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created');

    const requestBody: InviteRequest = await req.json();
    const { email, role, token } = requestBody;

    console.log('Request body:', { email, role, hasToken: !!token });

    // Verify admin token
    const { data: sessionData, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('user_id, admin_users!inner(role)')
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !sessionData) {
      console.error('Invalid admin token:', sessionError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if requesting user is admin (only admins can invite other admins)
    const requestingUserRole = (sessionData as any).admin_users.role;
    if (role === 'admin' && requestingUserRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only admins can invite other admins' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate credentials
    const username = generateUsername(email);
    const password = generateRandomString(12);
    
    // Simple password hashing using btoa (for demo purposes - in production use proper hashing)
    const passwordHash = btoa(`${password}${username}`);

    console.log('Generated credentials:', { username, hasPassword: !!password });

    // Create new admin user
    const { data: newUser, error: createError } = await supabase
      .from('admin_users')
      .insert([{
        username,
        email,
        password_hash: passwordHash,
        role,
        is_active: true
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User created successfully:', newUser.id);

    // Send invitation email
    const roleText = role === 'admin' ? 'Administrator' : 'Mitarbeiter';
    const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '')}.lovable.app/admin1244`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Willkommen bei Elbtal Wohnen Admin</h2>
        
        <p>Hallo,</p>
        
        <p>Sie wurden als <strong>${roleText}</strong> zum Elbtal Wohnen Admin-System eingeladen.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Ihre Zugangsdaten:</h3>
          <p><strong>Benutzername:</strong> ${username}</p>
          <p><strong>Passwort:</strong> ${password}</p>
          <p><strong>Login-URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        </div>
        
        <p><strong>Berechtigungen als ${roleText}:</strong></p>
        <ul>
          ${role === 'admin' 
            ? '<li>Vollzugriff auf alle Admin-Funktionen</li><li>Kann andere Admins und Mitarbeiter verwalten</li><li>Kann Leads und Mitglieder löschen</li>'
            : '<li>Zugriff auf die meisten Admin-Funktionen</li><li>Kann keine Leads oder Mitglieder löschen</li><li>Kann keine anderen Benutzer verwalten</li>'
          }
        </ul>
        
        <p style="margin-top: 30px;">
          <strong>Wichtiger Hinweis:</strong> Bitte ändern Sie Ihr Passwort nach dem ersten Login für zusätzliche Sicherheit.
        </p>
        
        <p>Bei Fragen wenden Sie sich bitte an den Administrator.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.
        </p>
      </div>
    `;

    try {
      const emailResponse = await resend.emails.send({
        from: 'Elbtal Wohnen Admin <onboarding@resend.dev>',
        to: [email],
        subject: `Einladung zum Elbtal Wohnen Admin-System (${roleText})`,
        html: emailHtml,
      });

      console.log('Email sent successfully:', emailResponse);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails, user is already created
    }

    // Log the action
    await supabase
      .from('audit_log')
      .insert([{
        table_name: 'admin_users',
        operation: 'ADMIN_INVITE',
        details: {
          invited_email: email,
          invited_role: role,
          invited_by: sessionData.user_id,
          username: username
        }
      }]);

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: newUser.id,
        username,
        email,
        role
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-invite function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
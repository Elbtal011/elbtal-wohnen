import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to generate random token
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== ADMIN AUTH FUNCTION START ===')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    const { action, username, password, token } = requestBody

    console.log('Request:', { 
      action, 
      username: username || 'none',
      hasPassword: !!password,
      hasToken: !!token 
    })

    if (action === 'login') {
      console.log('=== LOGIN PROCESS ===')
      
      if (!username || !password) {
        console.log('Missing credentials')
        return new Response(
          JSON.stringify({ error: 'Username and password required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Clean up expired sessions first
      await supabase
        .from('admin_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())

      // Support login by username OR email; check both old and new hash formats for compatibility
      const identifier = username as string;
      const isEmail = identifier.includes('@');

      // Look up user by identifier first (without password)
      const { data: userRecord, error: userError } = await supabase
        .from('admin_users')
        .select('id, username, password_hash, is_active')
        .eq(isEmail ? 'email' : 'username', identifier)
        .maybeSingle();

      console.log('User lookup:', { found: !!userRecord, error: userError?.message });

      if (userError || !userRecord || userRecord.is_active === false) {
        console.log('Invalid credentials - user not found or inactive');
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Try both hash formats for backward compatibility:
      // 1. New format: btoa(password + username) - used for invited users
      // 2. Old format: btoa(password) - used for original admin users
      const newFormatHash = btoa(`${password}${userRecord.username}`);
      const oldFormatHash = btoa(password);
      
      console.log('Checking password formats for user:', userRecord.username);
      
      if (userRecord.password_hash !== newFormatHash && userRecord.password_hash !== oldFormatHash) {
        console.log('Invalid credentials - password mismatch (tried both formats)');
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const user = { id: userRecord.id, username: userRecord.username };

      // Generate session token
      const sessionToken = generateSessionToken()
      console.log('Generated token:', sessionToken)

      // Create session in database
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .insert([{
          token: sessionToken,
          user_id: user.id,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }])
        .select()
        .single()

      console.log('Session creation:', { success: !!session, error: sessionError?.message })

      if (sessionError || !session) {
        console.log('Failed to create session')
        return new Response(
          JSON.stringify({ error: 'Login failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      console.log('Login successful for:', user.username)
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { id: user.id, username: user.username },
          token: sessionToken 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verify') {
      console.log('=== TOKEN VERIFICATION ===')
      
      if (!token) {
        console.log('No token provided')
        return new Response(
          JSON.stringify({ error: 'No token provided' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      console.log('Verifying token:', token)

      // Look up session and user
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .select(`
          id,
          token,
          expires_at,
          is_active,
          user:admin_users(id, username)
        `)
        .eq('token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      console.log('Session lookup:', { 
        found: !!session, 
        error: sessionError?.message,
        expired: session ? new Date(session.expires_at) < new Date() : 'N/A'
      })

      if (sessionError || !session || !session.user) {
        console.log('Invalid or expired token')
        return new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      console.log('Token verification successful for:', session.user.username)
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { id: session.user.id, username: session.user.username }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'logout') {
      console.log('=== LOGOUT PROCESS ===')
      
      if (token) {
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('token', token)
        console.log('Session deactivated')
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Invalid action:', action)
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('FATAL ERROR:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupResponse {
  success: boolean;
  backup_id?: string;
  download_url?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { action, backup_id } = await req.json();

    switch (action) {
      case 'create_backup':
        return await createBackup(supabase);
      case 'list_backups':
        return await listBackups(supabase);
      case 'download_backup':
        return await downloadBackup(supabase, backup_id);
      case 'delete_backup':
        return await deleteBackup(supabase, backup_id);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Backup system error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createBackup(supabase: any): Promise<Response> {
  console.log('Creating backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${timestamp}.zip`;
  const backupPath = `daily/${backupFileName}`;

  try {
    // Create ZIP archive using streams
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Start ZIP creation in background
    createZipArchive(supabase, writer);

    // Upload the ZIP to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('backups')
      .upload(backupPath, readable, {
        contentType: 'application/zip',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }

    // Get file size
    const { data: fileInfo } = await supabase.storage
      .from('backups')
      .list('daily', { search: backupFileName });

    const fileSize = fileInfo?.[0]?.metadata?.size || 0;

    // Record backup in database
    const { data: backupRecord, error: recordError } = await supabase
      .from('backup_records')
      .insert({
        file_name: backupFileName,
        file_path: backupPath,
        file_size: fileSize,
        backup_type: 'manual',
        metadata: {
          created_by: 'admin',
          tables_included: ['properties', 'contact_requests', 'cities', 'property_types', 'profiles'],
          storage_buckets: ['property-images', 'featured-images', 'lead-documents', 'user-documents']
        }
      })
      .select()
      .single();

    if (recordError) {
      console.error('Record error:', recordError);
      throw new Error(`Failed to record backup: ${recordError.message}`);
    }

    // Cleanup old backups
    await supabase.rpc('cleanup_old_backups');

    return new Response(
      JSON.stringify({
        success: true,
        backup_id: backupRecord.id,
        message: 'Backup created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Backup creation failed:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createZipArchive(supabase: any, writer: WritableStreamDefaultWriter) {
  try {
    // Create a simple ZIP-like structure (basic implementation)
    const encoder = new TextEncoder();
    
    // Export database data
    const tables = ['properties', 'contact_requests', 'cities', 'property_types', 'profiles', 'backup_records'];
    const dbExport = { timestamp: new Date().toISOString(), tables: {} };

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (!error) {
          dbExport.tables[table] = data;
        }
      } catch (err) {
        console.warn(`Failed to export table ${table}:`, err);
      }
    }

    // Write database export to ZIP
    const dbData = JSON.stringify(dbExport, null, 2);
    await writer.write(encoder.encode(`Database Export:\n${dbData}\n\n`));

    // Add storage bucket information
    const buckets = ['property-images', 'featured-images', 'lead-documents', 'user-documents'];
    const storageInfo = { buckets: {} };

    for (const bucket of buckets) {
      try {
        const { data: files } = await supabase.storage.from(bucket).list();
        storageInfo.buckets[bucket] = files?.map(f => ({
          name: f.name,
          size: f.metadata?.size,
          updated_at: f.updated_at
        })) || [];
      } catch (err) {
        console.warn(`Failed to list bucket ${bucket}:`, err);
      }
    }

    const storageData = JSON.stringify(storageInfo, null, 2);
    await writer.write(encoder.encode(`Storage Information:\n${storageData}\n`));

  } catch (error) {
    console.error('ZIP creation error:', error);
  } finally {
    await writer.close();
  }
}

async function listBackups(supabase: any): Promise<Response> {
  const { data, error } = await supabase
    .from('backup_records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ backups: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function downloadBackup(supabase: any, backupId: string): Promise<Response> {
  // Get backup record
  const { data: backup, error: backupError } = await supabase
    .from('backup_records')
    .select('*')
    .eq('id', backupId)
    .single();

  if (backupError || !backup) {
    return new Response(
      JSON.stringify({ error: 'Backup not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Generate signed URL for download
  const { data: signedUrl, error: urlError } = await supabase.storage
    .from('backups')
    .createSignedUrl(backup.file_path, 3600); // 1 hour expiry

  if (urlError) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate download URL' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      download_url: signedUrl.signedUrl,
      file_name: backup.file_name,
      file_size: backup.file_size
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteBackup(supabase: any, backupId: string): Promise<Response> {
  // Get backup record
  const { data: backup, error: backupError } = await supabase
    .from('backup_records')
    .select('*')
    .eq('id', backupId)
    .single();

  if (backupError || !backup) {
    return new Response(
      JSON.stringify({ error: 'Backup not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Delete file from storage
  const { error: deleteError } = await supabase.storage
    .from('backups')
    .remove([backup.file_path]);

  if (deleteError) {
    console.warn('Failed to delete backup file:', deleteError);
  }

  // Delete backup record
  const { error: recordError } = await supabase
    .from('backup_records')
    .delete()
    .eq('id', backupId);

  if (recordError) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete backup record' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Backup deleted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
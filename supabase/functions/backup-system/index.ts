import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
// Import ZIP utilities (Deno-compatible)
import JSZip from 'https://esm.sh/jszip@3.10.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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
    return new Response('ok', { status: 200, headers: corsHeaders });
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
  console.log('Creating comprehensive backup with actual files...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `complete-backup-${timestamp}.zip`;
  const backupPath = `daily/${backupFileName}`;

  try {
    // Create ZIP archive
    const zip = new JSZip();
    
    // 1. Export complete database as SQL
    console.log('Exporting database...');
    const dbFolder = zip.folder('database');
    await exportDatabaseToZip(supabase, dbFolder);

    // 2. Download and add all storage files
    console.log('Adding storage files...');
    const storageFolder = zip.folder('storage');
    const buckets = ['property-images', 'featured-images', 'lead-documents', 'user-documents', 'profile-images'];
    let totalFilesAdded = 0;

    for (const bucketName of buckets) {
      console.log(`Processing bucket: ${bucketName}`);
      const bucketFolder = storageFolder.folder(bucketName);
      const filesAdded = await addBucketFilesToZip(supabase, bucketName, bucketFolder);
      totalFilesAdded += filesAdded;
    }

    // 3. Add backup metadata
    const metadata = {
      backup_created: new Date().toISOString(),
      backup_type: 'complete',
      database_tables_included: ['properties', 'contact_requests', 'cities', 'property_types', 'profiles', 'admin_users', 'admin_sessions', 'lead_documents', 'user_documents', 'backup_records', 'audit_log'],
      storage_buckets_included: buckets,
      total_files_included: totalFilesAdded,
      supabase_project_id: supabaseUrl.split('//')[1].split('.')[0]
    };

    zip.file('backup-info.json', JSON.stringify(metadata, null, 2));

    // 4. Generate ZIP file
    console.log('Generating ZIP file...');
    const zipBlob = await zip.generateAsync({ 
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    console.log(`ZIP file generated, size: ${zipBlob.length} bytes`);

    // 5. Upload to storage
    const zipFile = new Blob([zipBlob], { type: 'application/zip' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('backups')
      .upload(backupPath, zipFile, {
        contentType: 'application/zip',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }

    // 6. Record backup in database
    const { data: backupRecord, error: recordError } = await supabase
      .from('backup_records')
      .insert({
        file_name: backupFileName,
        file_path: backupPath,
        file_size: zipBlob.length,
        backup_type: 'manual',
        metadata: {
          created_by: 'admin',
          total_files_included: totalFilesAdded,
          buckets_processed: buckets,
          database_tables: metadata.database_tables_included
        }
      })
      .select()
      .single();

    if (recordError) {
      console.error('Record error:', recordError);
      throw new Error(`Failed to record backup: ${recordError.message}`);
    }

    // 7. Cleanup old backups
    await supabase.rpc('cleanup_old_backups');

    console.log(`Backup created successfully: ${backupFileName} (${zipBlob.length} bytes, ${totalFilesAdded} files)`);

    return new Response(
      JSON.stringify({
        success: true,
        backup_id: backupRecord.id,
        file_size: zipBlob.length,
        files_included: totalFilesAdded,
        message: 'Complete backup created successfully'
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

async function exportDatabaseToZip(supabase: any, dbFolder: any) {
  const tables = [
    'properties', 'contact_requests', 'cities', 'property_types', 
    'profiles', 'admin_users', 'admin_sessions', 'lead_documents', 
    'user_documents', 'backup_records', 'audit_log'
  ];

  // Export each table as JSON (since we can't run raw SQL dumps in edge functions)
  for (const table of tables) {
    try {
      console.log(`Exporting table: ${table}`);
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.warn(`Failed to export table ${table}:`, error);
        continue;
      }

      // Create SQL-like INSERT statements for easier restoration
      const sqlStatements = generateInsertStatements(table, data);
      dbFolder.file(`${table}.sql`, sqlStatements);
      
      // Also save as JSON for flexibility
      dbFolder.file(`${table}.json`, JSON.stringify(data, null, 2));
      
    } catch (err) {
      console.warn(`Error exporting table ${table}:`, err);
    }
  }

  // Create a restoration script
  const restorationScript = `
-- Database Restoration Script
-- Generated on: ${new Date().toISOString()}
-- 
-- To restore this backup:
-- 1. Create a new Supabase project
-- 2. Run each table's SQL file in order
-- 3. Upload storage files to respective buckets
-- 4. Configure RLS policies as needed

-- Order of restoration (due to dependencies):
-- 1. cities.sql
-- 2. property_types.sql  
-- 3. admin_users.sql
-- 4. properties.sql
-- 5. profiles.sql
-- 6. contact_requests.sql
-- 7. admin_sessions.sql
-- 8. lead_documents.sql
-- 9. user_documents.sql
-- 10. backup_records.sql
-- 11. audit_log.sql
`;

  dbFolder.file('README.txt', restorationScript);
}

function generateInsertStatements(table: string, data: any[]): string {
  if (!data || data.length === 0) {
    return `-- No data found for table: ${table}\n`;
  }

  const columns = Object.keys(data[0]);
  let sql = `-- Table: ${table}\n`;
  sql += `-- Records: ${data.length}\n\n`;

  for (const row of data) {
    const values = columns.map(col => {
      const value = row[col];
      if (value === null) return 'NULL';
      if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
      if (typeof value === 'boolean') return value.toString();
      if (value instanceof Date) return `'${value.toISOString()}'`;
      if (Array.isArray(value)) return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
      if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
      return value.toString();
    });

    sql += `INSERT INTO public.${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
  }

  return sql + '\n';
}

async function addBucketFilesToZip(supabase: any, bucketName: string, bucketFolder: any): Promise<number> {
  try {
    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

    if (listError) {
      console.warn(`Failed to list files in bucket ${bucketName}:`, listError);
      return 0;
    }

    if (!files || files.length === 0) {
      console.log(`No files found in bucket: ${bucketName}`);
      return 0;
    }

    let filesAdded = 0;

    // Download and add each file to ZIP
    for (const file of files) {
      try {
        if (file.name === '.emptyFolderPlaceholder') continue;

        console.log(`Downloading file: ${bucketName}/${file.name}`);
        
        // Download the file
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(bucketName)
          .download(file.name);

        if (downloadError) {
          console.warn(`Failed to download ${bucketName}/${file.name}:`, downloadError);
          continue;
        }

        if (fileData) {
          // Convert blob to array buffer
          const arrayBuffer = await fileData.arrayBuffer();
          
          // Add file to ZIP with proper path
          const fileName = file.name.split('/').pop() || file.name;
          bucketFolder.file(fileName, arrayBuffer);
          
          filesAdded++;
          console.log(`Added file to backup: ${bucketName}/${fileName}`);
        }

      } catch (fileError) {
        console.warn(`Error processing file ${bucketName}/${file.name}:`, fileError);
      }
    }

    console.log(`Added ${filesAdded} files from bucket: ${bucketName}`);
    return filesAdded;

  } catch (error) {
    console.error(`Error processing bucket ${bucketName}:`, error);
    return 0;
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
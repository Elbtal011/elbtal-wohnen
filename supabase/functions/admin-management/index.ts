import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== FUNCTION START ===')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Supabase client created')

    const requestBody = await req.json()
    console.log('Raw request body:', JSON.stringify(requestBody, null, 2))
    
    const { action, token, ...data } = requestBody
    console.log('Parsed action:', action)
    console.log('Token exists:', !!token)

    // Verify admin token using sessions table
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 401 
        }
      )
    }

    // Verify session token in admin_sessions table
    const { data: sessionData, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('user_id, is_active, expires_at')
      .eq('token', token)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle()

    if (sessionError) {
      console.error('Session query error:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Session validation failed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      )
    }

    if (!sessionData) {
      console.error('No valid session found for token')
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 401 
        }
      )
    }

    // Handle different actions
    switch (action) {
      case 'get_properties':
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select(`
            *,
            city:cities(name),
            property_type:property_types(name)
          `)
          .order('created_at', { ascending: false })

        if (propError) throw propError

        return new Response(
          JSON.stringify({ properties }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_contact_requests':
        // Get contact requests with property information
        const { data: requests, error: reqError } = await supabase
          .from('contact_requests')
          .select(`
            *,
            property:properties(title, address)
          `)
          .order('created_at', { ascending: false })

        if (reqError) throw reqError

        // Get property applications for all users
        const { data: applications, error: appsError } = await supabase
          .from('property_applications')
          .select(`
            *,
            property:properties(title, address, city:cities(name))
          `)
          .order('created_at', { ascending: false })

        if (appsError) {
          console.error('Error fetching applications:', appsError);
        }

        // Combine contact requests with application info
        const requestsWithApplications = requests.map(request => ({
          ...request,
          applications: applications?.filter(app => app.email === request.email) || []
        }));

        return new Response(
          JSON.stringify({ 
            requests: requestsWithApplications,
            applications: applications || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_cities':
        const { data: cities, error: citiesError } = await supabase
          .from('cities')
          .select('*')
          .order('display_order', { ascending: true })

        if (citiesError) throw citiesError

        return new Response(
          JSON.stringify({ cities }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_property_inquiries':
        const { propertyId } = data
        const { data: inquiries, error: inquiriesError } = await supabase
          .from('contact_requests')
          .select('*')
          .eq('property_id', propertyId)
          .order('created_at', { ascending: false })

        if (inquiriesError) throw inquiriesError

        return new Response(
          JSON.stringify({ inquiries }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_analytics':
        const { timeRange } = data
        const daysAgo = parseInt(timeRange) || 30
        const dateThreshold = new Date()
        dateThreshold.setDate(dateThreshold.getDate() - daysAgo)
        
        // Get all properties count
        const { data: allProperties, error: propCountError } = await supabase
          .from('properties')
          .select('id, title, is_active')
        
        if (propCountError) throw propCountError
        
        // Get all contact requests
        const { data: allRequests, error: allRequestsError } = await supabase
          .from('contact_requests')
          .select('id, status, created_at, property_id')
        
        if (allRequestsError) throw allRequestsError
        
        // Get inquiries by property to find trending properties
        const propertyInquiries = {}
        allRequests.forEach(request => {
          if (request.property_id) {
            if (!propertyInquiries[request.property_id]) {
              propertyInquiries[request.property_id] = 0
            }
            propertyInquiries[request.property_id]++
          }
        })
        
        // Create trending properties list
        const topPerformingProperties = allProperties
          .map(property => ({
            id: property.id,
            title: property.title,
            inquiries: propertyInquiries[property.id] || 0
          }))
          .sort((a, b) => b.inquiries - a.inquiries)
          .slice(0, 10)
        
        // Calculate inquiries by status
        const inquiriesByStatus = allRequests.reduce((acc, request) => {
          const existing = acc.find(item => item.status === request.status)
          if (existing) {
            existing.count++
          } else {
            acc.push({ status: request.status, count: 1 })
          }
          return acc
        }, [])
        
        // Filter recent inquiries
        const recentRequests = allRequests.filter(request => 
          new Date(request.created_at) >= dateThreshold
        )
        
        // Calculate monthly trends starting from August 2025 (12 months forward)
        const monthlyInquiries = []
        const startYear = 2025
        const startMonth = 7 // August (0-based index)
        
        for (let i = 0; i < 12; i++) {
          const targetMonth = (startMonth + i) % 12
          const targetYear = startYear + Math.floor((startMonth + i) / 12)
          
          const monthStart = new Date(targetYear, targetMonth, 1)
          const monthEnd = new Date(targetYear, targetMonth + 1, 0)
          
          const monthCount = allRequests.filter(request => {
            const reqDate = new Date(request.created_at)
            return reqDate >= monthStart && reqDate <= monthEnd
          }).length
          
          const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
          monthlyInquiries.push({
            month: `${monthNames[targetMonth]} ${targetYear.toString().slice(-2)}`,
            count: monthCount,
            year: targetYear
          })
        }
        
        const analytics = {
          totalProperties: allProperties.length,
          activeProperties: allProperties.filter(p => p.is_active).length,
          totalInquiries: allRequests.length,
          newInquiries: allRequests.filter(r => r.status === 'new').length,
          inquiriesThisMonth: recentRequests.length,
          topPerformingProperties,
          inquiriesByStatus,
          monthlyInquiries
        }
        
        return new Response(
          JSON.stringify({ analytics }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_property_types':
        const { data: types, error: typesError } = await supabase
          .from('property_types')
          .select('*')
          .order('display_order', { ascending: true })

        if (typesError) throw typesError

        return new Response(
          JSON.stringify({ property_types: types }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create_property':
        try {
          const propertyData = data.propertyData || data.property;
          
          if (!propertyData) {
            return new Response(
              JSON.stringify({ error: 'Property data is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('Received property data:', JSON.stringify(propertyData, null, 2));

          // Basic validation for required fields
          if (!propertyData.title || !propertyData.address || !propertyData.rooms) {
            return new Response(
              JSON.stringify({ error: 'Title, address, and rooms are required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Clean and validate data
          const cleanPropertyData = {
            title: String(propertyData.title).trim(),
            description: propertyData.description ? String(propertyData.description).trim() : null,
            address: String(propertyData.address).trim(),
            postal_code: propertyData.postal_code ? String(propertyData.postal_code).trim() : null,
            neighborhood: propertyData.neighborhood ? String(propertyData.neighborhood).trim() : null,
            rooms: String(propertyData.rooms).trim(),
            area_sqm: Math.max(1, parseInt(propertyData.area_sqm) || 1),
            price_monthly: Math.max(1, parseInt(propertyData.price_monthly) || 1),
            warmmiete_monthly: propertyData.warmmiete_monthly ? parseInt(propertyData.warmmiete_monthly) : null,
            additional_costs_monthly: propertyData.additional_costs_monthly ? parseInt(propertyData.additional_costs_monthly) : null,
            property_type_id: propertyData.property_type_id || null,
            city_id: propertyData.city_id || null,
            floor: propertyData.floor ? parseInt(propertyData.floor) : null,
            total_floors: propertyData.total_floors ? parseInt(propertyData.total_floors) : null,
            year_built: propertyData.year_built ? parseInt(propertyData.year_built) : null,
            available_from: propertyData.available_from || null,
            deposit_months: propertyData.deposit_months ? parseInt(propertyData.deposit_months) : 3,
            kitchen_equipped: Boolean(propertyData.kitchen_equipped),
            furnished: Boolean(propertyData.furnished),
            pets_allowed: Boolean(propertyData.pets_allowed),
            utilities_included: Boolean(propertyData.utilities_included),
            balcony: Boolean(propertyData.balcony),
            elevator: Boolean(propertyData.elevator),
            parking: Boolean(propertyData.parking),
            garden: Boolean(propertyData.garden),
            cellar: Boolean(propertyData.cellar),
            attic: Boolean(propertyData.attic),
            dishwasher: Boolean(propertyData.dishwasher),
            washing_machine: Boolean(propertyData.washing_machine),
            dryer: Boolean(propertyData.dryer),
            tv: Boolean(propertyData.tv),
            energy_certificate_type: propertyData.energy_certificate_type || null,
            energy_certificate_value: propertyData.energy_certificate_value || null,
            heating_type: propertyData.heating_type || null,
            heating_energy_source: propertyData.heating_energy_source || null,
            internet_speed: propertyData.internet_speed || null,
            features_description: propertyData.features_description || null,
            additional_description: propertyData.additional_description || null,
            neighborhood_description: propertyData.neighborhood_description || null,
            eigenschaften_description: propertyData.eigenschaften_description || null,
            eigenschaften_tags: Array.isArray(propertyData.eigenschaften_tags) ? propertyData.eigenschaften_tags : [],
            is_featured: Boolean(propertyData.is_featured),
            is_active: propertyData.is_active !== false,
            images: Array.isArray(propertyData.images) ? propertyData.images : []
          };

          console.log('Clean property data:', JSON.stringify(cleanPropertyData, null, 2));

          const { data: newProperty, error: createError } = await supabase
            .from('properties')
            .insert([cleanPropertyData])
            .select()
            .single()

          if (createError) {
            console.error('Database error:', createError);
            return new Response(
              JSON.stringify({ error: `Database error: ${createError.message}` }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('Property created successfully:', newProperty);

          return new Response(
            JSON.stringify({ property: newProperty }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Unexpected error in create_property:', error);
          return new Response(
            JSON.stringify({ error: `Unexpected error: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'update_property':
        const { data: updatedProperty, error: updateError } = await supabase
          .from('properties')
          .update(data.property)
          .eq('id', data.id)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ property: updatedProperty }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'delete_property':
        const { error: deleteError } = await supabase
          .from('properties')
          .delete()
          .eq('id', data.id)

        if (deleteError) throw deleteError

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create_city':
        const { data: newCity, error: cityCreateError } = await supabase
          .from('cities')
          .insert([data.city])
          .select()
          .single()

        if (cityCreateError) throw cityCreateError

        return new Response(
          JSON.stringify({ city: newCity }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update_contact_request_status':
        const { data: updatedRequest, error: statusError } = await supabase
          .from('contact_requests')
          .update({ status: data.status })
          .eq('id', data.id)
          .select()
          .single()

        if (statusError) throw statusError

        return new Response(
          JSON.stringify({ request: updatedRequest }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update_contact_request_label':
        const { data: labeledRequest, error: labelError } = await supabase
          .from('contact_requests')
          .update({ lead_label: data.lead_label })
          .eq('id', data.id)
          .select()
          .single()

        if (labelError) throw labelError

        return new Response(
          JSON.stringify({ request: labeledRequest }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update_contact_request_stage':
        const { data: stagedRequest, error: stageError } = await supabase
          .from('contact_requests')
          .update({ lead_stage: data.lead_stage })
          .eq('id', data.id)
          .select()
          .single()

        if (stageError) throw stageError

        return new Response(
          JSON.stringify({ request: stagedRequest }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_members':
        try {
          // Fetch all profiles (optional extra data)
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
          if (profilesError) console.warn('profiles query error (non-fatal):', profilesError);

          // Fetch all auth users to ensure we can match by email even if profile row is missing
          const users: any[] = []
          let page = 1
          const perPage = 1000
          while (true) {
            const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage })
            if (listErr) throw listErr
            users.push(...(list?.users || []))
            if (!list || list.users.length < perPage) break
            page++
          }

          // Merge profiles with auth users by user_id
          const profileByUserId = new Map((profiles || []).map((p: any) => [p.user_id, p]))
          const membersWithEmails = users.map((u: any) => {
            const profile = profileByUserId.get(u.id)
            return {
              ...(profile || {}),
              user_id: u.id,
              id: profile?.id ?? u.id, // keep a stable id
              email: u.email ?? 'N/A',
              created_at: profile?.created_at ?? u.created_at
            }
          })

          return new Response(
            JSON.stringify({ members: membersWithEmails }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error fetching members:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch members', details: (error as any)?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'create_contact_request': {
        // Validate required fields
        const required = ['vorname','nachname','email','telefon','nachricht']
        for (const key of required) {
          if (!data[key] || String(data[key]).trim() === '') {
            return new Response(
              JSON.stringify({ error: `Field '${key}' is required` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }
        }

        const payload = {
          anrede: data.anrede ? String(data.anrede).toLowerCase() : null,
          vorname: String(data.vorname).trim(),
          nachname: String(data.nachname).trim(),
          email: String(data.email).trim(),
          telefon: String(data.telefon).trim(),
          nachricht: String(data.nachricht).trim(),
          strasse: data.strasse ? String(data.strasse).trim() : null,
          nummer: data.nummer ? String(data.nummer).trim() : null,
          plz: data.plz ? String(data.plz).trim() : null,
          ort: data.ort ? String(data.ort).trim() : null,
          property_id: data.property_id || null,
          lead_label: data.lead_label ?? null,
          status: data.status ? String(data.status).trim() : 'new',
        }

        const { data: newRequest, error: insertErr } = await supabase
          .from('contact_requests')
          .insert([payload])
          .select()
          .single()

        if (insertErr) throw insertErr

        return new Response(
          JSON.stringify({ request: newRequest, contact_request_id: newRequest.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
        )
      }

      case 'update_city':
        const { cityId, city: cityUpdateData } = data
        
        const { data: updatedCity, error: updateCityError } = await supabase
          .from('cities')
          .update({
            name: cityUpdateData.name,
            slug: cityUpdateData.slug,
            display_order: cityUpdateData.display_order,
            is_active: cityUpdateData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', cityId)
          .select()
          .single()
        
        if (updateCityError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update city', details: updateCityError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 400 
            }
          )
        }
        
        return new Response(
          JSON.stringify({ city: updatedCity }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'delete_contact_requests': {
        const ids: string[] = Array.isArray(data.ids) ? data.ids : []
        if (!ids.length) {
          return new Response(
            JSON.stringify({ error: 'No ids provided' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { error: delErr } = await supabase
          .from('contact_requests')
          .delete()
          .in('id', ids)

        if (delErr) throw delErr

        return new Response(
          JSON.stringify({ success: true, deleted: ids.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete_city':
        const { cityId: deleteId } = data
        
        // First delete all properties related to this city
        const { error: deletePropertiesError } = await supabase
          .from('properties')
          .delete()
          .eq('city_id', deleteId)
        
        if (deletePropertiesError) {
          return new Response(
            JSON.stringify({ error: 'Failed to delete related properties', details: deletePropertiesError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 400 
            }
          )
        }
        
        // Then delete the city
        const { error: deleteCityError } = await supabase
          .from('cities')
          .delete()
          .eq('id', deleteId)
        
        if (deleteCityError) {
          return new Response(
            JSON.stringify({ error: 'Failed to delete city', details: deleteCityError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 400 
            }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true, message: 'City and related properties deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'upload_lead_document':
        try {
          const { contactRequestId, documentType, fileName, fileData, contentType } = data;
          
          // Generate unique file path
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filePath = `${contactRequestId}/${documentType}/${timestamp}-${fileName}`;
          
          // Upload file to storage
          // Decode base64 string to bytes (handles optional data URL prefix)
          const base64String = typeof fileData === 'string' ? (fileData.split(',').pop() ?? fileData) : fileData;
          const binaryString = atob(base64String);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('lead-documents')
            .upload(filePath, bytes, {
              contentType,
              upsert: false
            });

          if (uploadError) throw uploadError;

          // Save document record to database
          const { data: docRecord, error: docError } = await supabase
            .from('lead_documents')
            .insert({
              contact_request_id: contactRequestId,
              document_type: documentType,
              file_name: fileName,
              file_path: filePath,
              content_type: contentType
            })
            .select()
            .single();

          if (docError) throw docError;

          return new Response(
            JSON.stringify({ document: docRecord }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Document upload error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to upload document', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'get_lead_documents':
        try {
          const { contactRequestId } = data;
          
          const { data: documents, error: docsError } = await supabase
            .from('lead_documents')
            .select('*')
            .eq('contact_request_id', contactRequestId)
            .order('created_at', { ascending: false });

          if (docsError) {
            // If table doesn't exist yet, return empty list gracefully
            const code = (docsError as any).code || '';
            const msg = (docsError as any).message || '';
            if (code === '42P01' || String(msg).toLowerCase().includes('does not exist')) {
              return new Response(
                JSON.stringify({ documents: [] }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            throw docsError;
          }

          return new Response(
            JSON.stringify({ documents }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Get documents error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get documents', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'get_document_download_url':
        try {
          const { filePath } = data;
          
          const { data: urlData, error: urlError } = await supabase.storage
            .from('lead-documents')
            .createSignedUrl(filePath, 3600); // 1 hour expiry

          if (urlError) throw urlError;

          return new Response(
            JSON.stringify({ url: urlData.signedUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Get download URL error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get download URL', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'delete_lead_document':
        try {
          const { documentId, filePath } = data;
          
          // Delete from storage
          const { error: storageError } = await supabase.storage
            .from('lead-documents')
            .remove([filePath]);

          if (storageError) {
            console.warn('Storage deletion error:', storageError);
          }

          // Delete from database
          const { error: dbError } = await supabase
            .from('lead_documents')
            .delete()
            .eq('id', documentId);

          if (dbError) throw dbError;

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Delete document error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to delete document', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'get_user_documents':
        try {
          const { user_id } = data;
          
          const { data: documents, error: docsError } = await supabase
            .from('user_documents')
            .select('*')
            .eq('user_id', user_id)
            .order('uploaded_at', { ascending: false });

          if (docsError) throw docsError;

          return new Response(
            JSON.stringify({ documents }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Get user documents error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get user documents', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'get_user_document_download_url':
        try {
          const { filePath } = data;
          
          const { data: urlData, error: urlError } = await supabase.storage
            .from('user-documents')
            .createSignedUrl(filePath, 3600); // 1 hour expiry

          if (urlError) throw urlError;

          return new Response(
            JSON.stringify({ url: urlData.signedUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Get user document download URL error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get user documents', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'get_lead_document_download_url':
        try {
          const { filePath } = data;
          
          const { data: urlData, error: urlError } = await supabase.storage
            .from('lead-documents')
            .createSignedUrl(filePath, 3600); // 1 hour expiry

          if (urlError) throw urlError;

          return new Response(
            JSON.stringify({ url: urlData.signedUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Get lead document download URL error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to get lead document URL', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'bulk_delete_properties':
        const { error: bulkDeleteError } = await supabase
          .from('properties')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // This will delete all properties
        
        if (bulkDeleteError) {
          return new Response(
            JSON.stringify({ error: 'Failed to delete properties', details: bulkDeleteError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 400 
            }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true, message: 'All properties deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update_application_status':
        try {
          const { applicationId, status } = data;
          
          const { error: updateError } = await supabase
            .from('property_applications')
            .update({ status })
            .eq('id', applicationId);

          if (updateError) throw updateError;

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Update application status error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update application status', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'update_lead':
        try {
          const { id, vorname, nachname, email, telefon, strasse, nummer, plz, ort, nettoeinkommen } = data;
          
          // Update contact request basic info
          const { error: updateError } = await supabase
            .from('contact_requests')
            .update({ 
              vorname, 
              nachname, 
              email, 
              telefon, 
              strasse, 
              nummer, 
              plz, 
              ort,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (updateError) throw updateError;

          // If nettoeinkommen is provided, update it in the nachricht field
          if (nettoeinkommen) {
            const { data: currentLead, error: fetchError } = await supabase
              .from('contact_requests')
              .select('nachricht')
              .eq('id', id)
              .single();

            if (fetchError) throw fetchError;

            // Parse existing message and update Nettoeinkommen
            const lines = currentLead.nachricht.split('\n');
            let nettoFound = false;
            const updatedLines = lines.map(line => {
              if (line.startsWith('Nettoeinkommen:')) {
                nettoFound = true;
                return `Nettoeinkommen: ${nettoeinkommen}`;
              }
              return line;
            });

            // If Nettoeinkommen wasn't found, add it
            if (!nettoFound) {
              updatedLines.push(`Nettoeinkommen: ${nettoeinkommen}`);
            }

            const updatedMessage = updatedLines.join('\n');

            const { error: messageUpdateError } = await supabase
              .from('contact_requests')
              .update({ nachricht: updatedMessage })
              .eq('id', id);

            if (messageUpdateError) throw messageUpdateError;
          }

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Update lead error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update lead', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'delete_members':
        try {
          const { memberIds } = data;
          
          if (!Array.isArray(memberIds) || memberIds.length === 0) {
            return new Response(
              JSON.stringify({ error: 'Member IDs array is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Get member details first
          const { data: members, error: membersError } = await supabase
            .from('profiles')
            .select('id, user_id, first_name, last_name')
            .in('id', memberIds);

          if (membersError) throw membersError;

          const memberEmails = [];
          
          // Get emails for each member to delete associated contact requests
          for (const member of members || []) {
            try {
              const { data: userData, error: userError } = await supabase.auth.admin.getUserById(member.user_id);
              if (!userError && userData.user?.email) {
                memberEmails.push(userData.user.email);
              }
            } catch (error) {
              console.error('Error fetching user email for deletion:', error);
            }

            // Delete user documents from storage
            try {
              await supabase.storage
                .from('user-documents')
                .remove([`${member.user_id}/`]);
            } catch (error) {
              console.warn('Error deleting user documents:', error);
            }

            // Delete profile images from storage
            try {
              await supabase.storage
                .from('profile-images')
                .remove([`${member.user_id}/`]);
            } catch (error) {
              console.warn('Error deleting profile images:', error);
            }
          }

          // Delete associated leads (contact_requests) by email
          if (memberEmails.length > 0) {
            const { error: leadsError } = await supabase
              .from('contact_requests')
              .delete()
              .in('email', memberEmails);

            if (leadsError) {
              console.warn('Error deleting contact requests:', leadsError);
            }
          }

          // Delete user documents records
          for (const member of members || []) {
            const { error: userDocsError } = await supabase
              .from('user_documents')
              .delete()
              .eq('user_id', member.user_id);

            if (userDocsError) {
              console.warn('Error deleting user document records:', userDocsError);
            }
          }

          // Delete profiles
          const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .in('id', memberIds);

          if (profileError) throw profileError;

          // Delete auth users (requires service role)
          for (const member of members || []) {
            try {
              await supabase.auth.admin.deleteUser(member.user_id);
            } catch (error) {
              console.error('Error deleting auth user:', error);
            }
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: `${memberIds.length} members deleted successfully`,
              deletedCount: memberIds.length 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Delete members error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to delete members', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
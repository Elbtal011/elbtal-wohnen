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
        const { data: requests, error: reqError } = await supabase
          .from('contact_requests')
          .select(`
            *,
            property:properties(title, address)
          `)
          .order('created_at', { ascending: false })

        if (reqError) throw reqError

        return new Response(
          JSON.stringify({ requests }),
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
          JSON.stringify({ request: newRequest }),
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
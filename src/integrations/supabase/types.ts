export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_login: string | null
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          details: Json | null
          id: string
          operation: string
          table_name: string
          timestamp: string
        }
        Insert: {
          details?: Json | null
          id?: string
          operation: string
          table_name: string
          timestamp?: string
        }
        Update: {
          details?: Json | null
          id?: string
          operation?: string
          table_name?: string
          timestamp?: string
        }
        Relationships: []
      }
      backup_records: {
        Row: {
          backup_date: string
          backup_type: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          includes_database: boolean
          includes_storage: boolean
          metadata: Json | null
          status: string
        }
        Insert: {
          backup_date?: string
          backup_type?: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          includes_database?: boolean
          includes_storage?: boolean
          metadata?: Json | null
          status?: string
        }
        Update: {
          backup_date?: string
          backup_type?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          includes_database?: boolean
          includes_storage?: boolean
          metadata?: Json | null
          status?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          anrede: string | null
          created_at: string
          email: string
          id: string
          lead_label: string | null
          lead_stage: string | null
          nachname: string
          nachricht: string
          nummer: string | null
          ort: string | null
          plz: string | null
          property_id: string | null
          status: string | null
          strasse: string | null
          telefon: string
          updated_at: string
          vorname: string
        }
        Insert: {
          anrede?: string | null
          created_at?: string
          email: string
          id?: string
          lead_label?: string | null
          lead_stage?: string | null
          nachname: string
          nachricht: string
          nummer?: string | null
          ort?: string | null
          plz?: string | null
          property_id?: string | null
          status?: string | null
          strasse?: string | null
          telefon: string
          updated_at?: string
          vorname: string
        }
        Update: {
          anrede?: string | null
          created_at?: string
          email?: string
          id?: string
          lead_label?: string | null
          lead_stage?: string | null
          nachname?: string
          nachricht?: string
          nummer?: string | null
          ort?: string | null
          plz?: string | null
          property_id?: string | null
          status?: string | null
          strasse?: string | null
          telefon?: string
          updated_at?: string
          vorname?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_documents: {
        Row: {
          contact_request_id: string
          content_type: string | null
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          contact_request_id: string
          content_type?: string | null
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          contact_request_id?: string
          content_type?: string | null
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_documents_contact_request_id_fkey"
            columns: ["contact_request_id"]
            isOneToOne: false
            referencedRelation: "contact_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          anrede: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          nettoeinkommen: number | null
          nummer: string | null
          ort: string | null
          plz: string | null
          profile_image_url: string | null
          staatsangehoerigkeit: string | null
          strasse: string | null
          telefon: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anrede?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          nettoeinkommen?: number | null
          nummer?: string | null
          ort?: string | null
          plz?: string | null
          profile_image_url?: string | null
          staatsangehoerigkeit?: string | null
          strasse?: string | null
          telefon?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anrede?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          nettoeinkommen?: number | null
          nummer?: string | null
          ort?: string | null
          plz?: string | null
          profile_image_url?: string | null
          staatsangehoerigkeit?: string | null
          strasse?: string | null
          telefon?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          additional_costs_monthly: number | null
          additional_description: string | null
          address: string
          area_sqm: number
          attic: boolean | null
          available_from: string | null
          balcony: boolean | null
          cellar: boolean | null
          city_id: string | null
          coordinates: unknown | null
          created_at: string
          deposit_months: number | null
          description: string | null
          dishwasher: boolean | null
          dryer: boolean | null
          eigenschaften_description: string | null
          eigenschaften_tags: string[] | null
          elevator: boolean | null
          energy_certificate_type: string | null
          energy_certificate_value: string | null
          features: string[] | null
          features_description: string | null
          floor: number | null
          furnished: boolean | null
          garden: boolean | null
          heating_energy_source: string | null
          heating_type: string | null
          id: string
          images: string[] | null
          internet_speed: string | null
          is_active: boolean | null
          is_featured: boolean | null
          kitchen_equipped: boolean | null
          neighborhood: string | null
          parking: boolean | null
          pets_allowed: boolean | null
          postal_code: string | null
          price_monthly: number
          property_type_id: string | null
          rooms: string
          title: string
          total_floors: number | null
          tv: boolean | null
          updated_at: string
          utilities_included: boolean | null
          warmmiete_monthly: number | null
          washing_machine: boolean | null
          year_built: number | null
        }
        Insert: {
          additional_costs_monthly?: number | null
          additional_description?: string | null
          address: string
          area_sqm: number
          attic?: boolean | null
          available_from?: string | null
          balcony?: boolean | null
          cellar?: boolean | null
          city_id?: string | null
          coordinates?: unknown | null
          created_at?: string
          deposit_months?: number | null
          description?: string | null
          dishwasher?: boolean | null
          dryer?: boolean | null
          eigenschaften_description?: string | null
          eigenschaften_tags?: string[] | null
          elevator?: boolean | null
          energy_certificate_type?: string | null
          energy_certificate_value?: string | null
          features?: string[] | null
          features_description?: string | null
          floor?: number | null
          furnished?: boolean | null
          garden?: boolean | null
          heating_energy_source?: string | null
          heating_type?: string | null
          id?: string
          images?: string[] | null
          internet_speed?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          kitchen_equipped?: boolean | null
          neighborhood?: string | null
          parking?: boolean | null
          pets_allowed?: boolean | null
          postal_code?: string | null
          price_monthly: number
          property_type_id?: string | null
          rooms: string
          title: string
          total_floors?: number | null
          tv?: boolean | null
          updated_at?: string
          utilities_included?: boolean | null
          warmmiete_monthly?: number | null
          washing_machine?: boolean | null
          year_built?: number | null
        }
        Update: {
          additional_costs_monthly?: number | null
          additional_description?: string | null
          address?: string
          area_sqm?: number
          attic?: boolean | null
          available_from?: string | null
          balcony?: boolean | null
          cellar?: boolean | null
          city_id?: string | null
          coordinates?: unknown | null
          created_at?: string
          deposit_months?: number | null
          description?: string | null
          dishwasher?: boolean | null
          dryer?: boolean | null
          eigenschaften_description?: string | null
          eigenschaften_tags?: string[] | null
          elevator?: boolean | null
          energy_certificate_type?: string | null
          energy_certificate_value?: string | null
          features?: string[] | null
          features_description?: string | null
          floor?: number | null
          furnished?: boolean | null
          garden?: boolean | null
          heating_energy_source?: string | null
          heating_type?: string | null
          id?: string
          images?: string[] | null
          internet_speed?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          kitchen_equipped?: boolean | null
          neighborhood?: string | null
          parking?: boolean | null
          pets_allowed?: boolean | null
          postal_code?: string | null
          price_monthly?: number
          property_type_id?: string | null
          rooms?: string
          title?: string
          total_floors?: number | null
          tv?: boolean | null
          updated_at?: string
          utilities_included?: boolean | null
          warmmiete_monthly?: number | null
          washing_machine?: boolean | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      property_applications: {
        Row: {
          adresse: string
          created_at: string
          einzugsdatum: string
          email: string
          geburtsdatum: string
          geburtsort: string
          id: string
          nachname: string
          nachricht: string
          nettoeinkommen: number
          ort: string
          postleitzahl: string
          property_id: string | null
          staatsangehoerigkeit: string
          status: string
          telefon: string
          updated_at: string
          user_id: string | null
          vorname: string
        }
        Insert: {
          adresse: string
          created_at?: string
          einzugsdatum: string
          email: string
          geburtsdatum: string
          geburtsort: string
          id?: string
          nachname: string
          nachricht: string
          nettoeinkommen: number
          ort: string
          postleitzahl: string
          property_id?: string | null
          staatsangehoerigkeit: string
          status?: string
          telefon: string
          updated_at?: string
          user_id?: string | null
          vorname: string
        }
        Update: {
          adresse?: string
          created_at?: string
          einzugsdatum?: string
          email?: string
          geburtsdatum?: string
          geburtsort?: string
          id?: string
          nachname?: string
          nachricht?: string
          nettoeinkommen?: number
          ort?: string
          postleitzahl?: string
          property_id?: string | null
          staatsangehoerigkeit?: string
          status?: string
          telefon?: string
          updated_at?: string
          user_id?: string | null
          vorname?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          content_type: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          content_type?: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          content_type?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_backups: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_scheduled_backup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_contact_requests_secure: {
        Args: { admin_token: string }
        Returns: {
          anrede: string
          created_at: string
          email: string
          id: string
          lead_label: string
          lead_stage: string
          nachname: string
          nachricht: string
          property_id: string
          status: string
          telefon: string
          vorname: string
        }[]
      }
      is_admin_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      trigger_daily_backup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

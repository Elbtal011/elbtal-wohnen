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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_contact_requests_secure: {
        Args: { admin_token: string }
        Returns: {
          anrede: string
          created_at: string
          email: string
          id: string
          lead_label: string
          nachname: string
          nachricht: string
          property_id: string
          status: string
          telefon: string
          vorname: string
        }[]
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

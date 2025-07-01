export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      definition_translations: {
        Row: {
          created_at: string | null
          definition_id: string | null
          example: string | null
          grammatical_class: string | null
          id: string
          language: string
          meaning: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          definition_id?: string | null
          example?: string | null
          grammatical_class?: string | null
          id?: string
          language: string
          meaning?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          definition_id?: string | null
          example?: string | null
          grammatical_class?: string | null
          id?: string
          language?: string
          meaning?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "definition_translations_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_definition_translations_definition_id"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      definitions: {
        Row: {
          created_at: string | null
          entry_id: string | null
          example: string | null
          grammatical_class: string
          id: string
          meaning: string
          position: number | null
        }
        Insert: {
          created_at?: string | null
          entry_id?: string | null
          example?: string | null
          grammatical_class: string
          id?: string
          meaning: string
          position?: number | null
        }
        Update: {
          created_at?: string | null
          entry_id?: string | null
          example?: string | null
          grammatical_class?: string
          id?: string
          meaning?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "definitions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "dictionary_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_definitions_entry_id"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "dictionary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      dictionaries: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dictionary_entries: {
        Row: {
          audio_url: string | null
          color_combo: number | null
          created_at: string | null
          dictionary_id: string | null
          id: string
          ipa: string | null
          origin: string | null
          position: number | null
          slug: string | null
          updated_at: string | null
          word: string
        }
        Insert: {
          audio_url?: string | null
          color_combo?: number | null
          created_at?: string | null
          dictionary_id?: string | null
          id?: string
          ipa?: string | null
          origin?: string | null
          position?: number | null
          slug?: string | null
          updated_at?: string | null
          word: string
        }
        Update: {
          audio_url?: string | null
          color_combo?: number | null
          created_at?: string | null
          dictionary_id?: string | null
          id?: string
          ipa?: string | null
          origin?: string | null
          position?: number | null
          slug?: string | null
          updated_at?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "dictionary_entries_dictionary_id_fkey"
            columns: ["dictionary_id"]
            isOneToOne: false
            referencedRelation: "dictionaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dictionary_entries_dictionary_id"
            columns: ["dictionary_id"]
            isOneToOne: false
            referencedRelation: "dictionaries"
            referencedColumns: ["id"]
          },
        ]
      }
      dictionary_translations: {
        Row: {
          created_at: string | null
          description: string | null
          dictionary_id: string | null
          id: string
          language: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dictionary_id?: string | null
          id?: string
          language: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dictionary_id?: string | null
          id?: string
          language?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dictionary_translations_dictionary_id_fkey"
            columns: ["dictionary_id"]
            isOneToOne: false
            referencedRelation: "dictionaries"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_translations: {
        Row: {
          created_at: string | null
          entry_id: string | null
          id: string
          language: string
          origin: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entry_id?: string | null
          id?: string
          language: string
          origin?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entry_id?: string | null
          id?: string
          language?: string
          origin?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entry_translations_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "dictionary_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_entry_translations_entry_id"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "dictionary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: {
        Args: { input_text: string }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

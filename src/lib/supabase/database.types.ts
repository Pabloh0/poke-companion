export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      abilities: {
        Row: {
          generation_id: number;
          id: number;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          generation_id: number;
          id: number;
          slug: string;
        };
        Update: {
          generation_id?: number;
          id?: number;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "abilities_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "generations";
            referencedColumns: ["id"];
          },
        ];
      };
      ability_translations: {
        Row: {
          ability_id: number;
          locale: string;
          name: string;
        };
        ComputedFields: never;
        Insert: {
          ability_id: number;
          locale: string;
          name: string;
        };
        Update: {
          ability_id?: number;
          locale?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ability_translations_ability_id_fkey";
            columns: ["ability_id"];
            isOneToOne: false;
            referencedRelation: "abilities";
            referencedColumns: ["id"];
          },
        ];
      };
      generations: {
        Row: {
          id: number;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          id: number;
          slug: string;
        };
        Update: {
          id?: number;
          slug?: string;
        };
        Relationships: [];
      };
      move_translations: {
        Row: {
          description: string | null;
          locale: string;
          move_id: number;
          name: string;
        };
        ComputedFields: never;
        Insert: {
          description?: string | null;
          locale: string;
          move_id: number;
          name: string;
        };
        Update: {
          description?: string | null;
          locale?: string;
          move_id?: number;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "move_translations_move_id_fkey";
            columns: ["move_id"];
            isOneToOne: false;
            referencedRelation: "moves";
            referencedColumns: ["id"];
          },
        ];
      };
      moves: {
        Row: {
          accuracy: number | null;
          damage_class: string;
          id: number;
          power: number | null;
          pp: number | null;
          priority: number;
          slug: string;
          type_id: number;
        };
        ComputedFields: never;
        Insert: {
          accuracy?: number | null;
          damage_class: string;
          id: number;
          power?: number | null;
          pp?: number | null;
          priority?: number;
          slug: string;
          type_id: number;
        };
        Update: {
          accuracy?: number | null;
          damage_class?: string;
          id?: number;
          power?: number | null;
          pp?: number | null;
          priority?: number;
          slug?: string;
          type_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "moves_type_id_fkey";
            columns: ["type_id"];
            isOneToOne: false;
            referencedRelation: "types";
            referencedColumns: ["id"];
          },
        ];
      };
      pokemon: {
        Row: {
          base_experience: number | null;
          height_dm: number;
          id: number;
          is_default: boolean;
          slug: string;
          species_id: number;
          weight_hg: number;
        };
        ComputedFields: never;
        Insert: {
          base_experience?: number | null;
          height_dm: number;
          id: number;
          is_default: boolean;
          slug: string;
          species_id: number;
          weight_hg: number;
        };
        Update: {
          base_experience?: number | null;
          height_dm?: number;
          id?: number;
          is_default?: boolean;
          slug?: string;
          species_id?: number;
          weight_hg?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pokemon_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "pokedex_entries";
            referencedColumns: ["dex_number"];
          },
          {
            foreignKeyName: "pokemon_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "pokemon_species";
            referencedColumns: ["id"];
          },
        ];
      };
      pokemon_abilities: {
        Row: {
          ability_id: number;
          is_hidden: boolean;
          pokemon_id: number;
          slot: number;
        };
        ComputedFields: never;
        Insert: {
          ability_id: number;
          is_hidden?: boolean;
          pokemon_id: number;
          slot: number;
        };
        Update: {
          ability_id?: number;
          is_hidden?: boolean;
          pokemon_id?: number;
          slot?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pokemon_abilities_ability_id_fkey";
            columns: ["ability_id"];
            isOneToOne: false;
            referencedRelation: "abilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pokemon_abilities_pokemon_id_fkey";
            columns: ["pokemon_id"];
            isOneToOne: false;
            referencedRelation: "pokemon";
            referencedColumns: ["id"];
          },
        ];
      };
      pokemon_moves: {
        Row: {
          level: number;
          machine: string | null;
          method: string;
          move_id: number;
          pokemon_id: number;
          version_group_id: number;
        };
        ComputedFields: never;
        Insert: {
          level?: number;
          machine?: string | null;
          method: string;
          move_id: number;
          pokemon_id: number;
          version_group_id: number;
        };
        Update: {
          level?: number;
          machine?: string | null;
          method?: string;
          move_id?: number;
          pokemon_id?: number;
          version_group_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pokemon_moves_move_id_fkey";
            columns: ["move_id"];
            isOneToOne: false;
            referencedRelation: "moves";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pokemon_moves_pokemon_id_fkey";
            columns: ["pokemon_id"];
            isOneToOne: false;
            referencedRelation: "pokemon";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pokemon_moves_version_group_id_fkey";
            columns: ["version_group_id"];
            isOneToOne: false;
            referencedRelation: "version_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      pokemon_species: {
        Row: {
          evolution_chain_id: number | null;
          evolves_from_species_id: number | null;
          generation_id: number;
          id: number;
          is_baby: boolean;
          is_legendary: boolean;
          is_mythical: boolean;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          evolution_chain_id?: number | null;
          evolves_from_species_id?: number | null;
          generation_id: number;
          id: number;
          is_baby?: boolean;
          is_legendary?: boolean;
          is_mythical?: boolean;
          slug: string;
        };
        Update: {
          evolution_chain_id?: number | null;
          evolves_from_species_id?: number | null;
          generation_id?: number;
          id?: number;
          is_baby?: boolean;
          is_legendary?: boolean;
          is_mythical?: boolean;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pokemon_species_evolves_from_species_id_fkey";
            columns: ["evolves_from_species_id"];
            isOneToOne: false;
            referencedRelation: "pokedex_entries";
            referencedColumns: ["dex_number"];
          },
          {
            foreignKeyName: "pokemon_species_evolves_from_species_id_fkey";
            columns: ["evolves_from_species_id"];
            isOneToOne: false;
            referencedRelation: "pokemon_species";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pokemon_species_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "generations";
            referencedColumns: ["id"];
          },
        ];
      };
      pokemon_species_translations: {
        Row: {
          flavor_text: string | null;
          genus: string | null;
          locale: string;
          name: string;
          species_id: number;
        };
        ComputedFields: never;
        Insert: {
          flavor_text?: string | null;
          genus?: string | null;
          locale: string;
          name: string;
          species_id: number;
        };
        Update: {
          flavor_text?: string | null;
          genus?: string | null;
          locale?: string;
          name?: string;
          species_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pokemon_species_translations_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "pokedex_entries";
            referencedColumns: ["dex_number"];
          },
          {
            foreignKeyName: "pokemon_species_translations_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "pokemon_species";
            referencedColumns: ["id"];
          },
        ];
      };
      pokemon_stats: {
        Row: {
          base_value: number;
          effort: number;
          pokemon_id: number;
          stat: string;
        };
        ComputedFields: never;
        Insert: {
          base_value: number;
          effort?: number;
          pokemon_id: number;
          stat: string;
        };
        Update: {
          base_value?: number;
          effort?: number;
          pokemon_id?: number;
          stat?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pokemon_stats_pokemon_id_fkey";
            columns: ["pokemon_id"];
            isOneToOne: false;
            referencedRelation: "pokemon";
            referencedColumns: ["id"];
          },
        ];
      };
      pokemon_types: {
        Row: {
          pokemon_id: number;
          slot: number;
          type_id: number;
        };
        ComputedFields: never;
        Insert: {
          pokemon_id: number;
          slot: number;
          type_id: number;
        };
        Update: {
          pokemon_id?: number;
          slot?: number;
          type_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pokemon_types_pokemon_id_fkey";
            columns: ["pokemon_id"];
            isOneToOne: false;
            referencedRelation: "pokemon";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pokemon_types_type_id_fkey";
            columns: ["type_id"];
            isOneToOne: false;
            referencedRelation: "types";
            referencedColumns: ["id"];
          },
        ];
      };
      type_translations: {
        Row: {
          locale: string;
          name: string;
          type_id: number;
        };
        ComputedFields: never;
        Insert: {
          locale: string;
          name: string;
          type_id: number;
        };
        Update: {
          locale?: string;
          name?: string;
          type_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "type_translations_type_id_fkey";
            columns: ["type_id"];
            isOneToOne: false;
            referencedRelation: "types";
            referencedColumns: ["id"];
          },
        ];
      };
      types: {
        Row: {
          id: number;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          id: number;
          slug: string;
        };
        Update: {
          id?: number;
          slug?: string;
        };
        Relationships: [];
      };
      version_groups: {
        Row: {
          generation_id: number;
          id: number;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          generation_id: number;
          id: number;
          slug: string;
        };
        Update: {
          generation_id?: number;
          id?: number;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "version_groups_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "generations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      pokedex_entries: {
        Row: {
          base_stat_total: number | null;
          dex_number: number;
          generation_id: number;
          genus: string | null;
          is_legendary: boolean;
          is_mythical: boolean;
          locale: string;
          name: string;
          slug: string;
          types: string[] | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "pokemon_species_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "generations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

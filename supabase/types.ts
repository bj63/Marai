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
      mirai_profile: {
        Row: {
          avatar: string | null;
          color: string | null;
          created_at: string;
          id: string;
          name: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar?: string | null;
          color?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar?: string | null;
          color?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mirai_profile_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      personality: {
        Row: {
          confidence: string;
          created_at: string;
          creativity: string;
          curiosity: string;
          empathy: string;
          energy: string;
          humor: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          confidence?: string;
          created_at?: string;
          creativity?: string;
          curiosity?: string;
          empathy?: string;
          energy?: string;
          humor?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          confidence?: string;
          created_at?: string;
          creativity?: string;
          curiosity?: string;
          empathy?: string;
          energy?: string;
          humor?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "personality_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      onboarding_state: {
        Row: {
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          current_step: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          current_step?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          current_step?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboarding_state_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      feed_posts: {
        Row: {
          color: string | null;
          created_at: string;
          id: string;
          metadata: Json | null;
          message: string;
          mirai_name: string | null;
          mood: string | null;
          music_url: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          message: string;
          mirai_name?: string | null;
          mood?: string | null;
          music_url?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          message?: string;
          mirai_name?: string | null;
          mood?: string | null;
          music_url?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_posts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      feed_likes: {
        Row: {
          created_at: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "feed_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feed_likes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      feed_comments: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          parent_id: string | null;
          post_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          parent_id?: string | null;
          post_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          parent_id?: string | null;
          post_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_comments_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "feed_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feed_comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "feed_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feed_comments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      dream_logs: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          media: Json | null;
          mood: string | null;
          tags: string[];
          title: string | null;
          updated_at: string;
          user_id: string;
          visibility: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          media?: Json | null;
          mood?: string | null;
          tags?: string[];
          title?: string | null;
          updated_at?: string;
          user_id: string;
          visibility?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          media?: Json | null;
          mood?: string | null;
          tags?: string[];
          title?: string | null;
          updated_at?: string;
          user_id?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dream_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      follows: {
        Row: {
          created_at: string;
          follower_id: string;
          following_id: string;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          following_id: string;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          read_at?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversation_members: {
        Row: {
          conversation_id: string;
          joined_at: string;
          member_id: string;
        };
        Insert: {
          conversation_id: string;
          joined_at?: string;
          member_id: string;
        };
        Update: {
          conversation_id?: string;
          joined_at?: string;
          member_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey";
            columns: ["conversation_id"];
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_members_member_id_fkey";
            columns: ["member_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          body: string;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_settings: {
        Row: {
          created_at: string;
          preferred_login: string | null;
          profile_visibility: string;
          share_activity: boolean;
          updated_at: string;
          user_id: string;
          wallet_address: string | null;
        };
        Insert: {
          created_at?: string;
          preferred_login?: string | null;
          profile_visibility?: string;
          share_activity?: boolean;
          updated_at?: string;
          user_id: string;
          wallet_address?: string | null;
        };
        Update: {
          created_at?: string;
          preferred_login?: string | null;
          profile_visibility?: string;
          share_activity?: boolean;
          updated_at?: string;
          user_id?: string;
          wallet_address?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      team_members: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          login_method: string | null;
          name: string | null;
          role: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          login_method?: string | null;
          name?: string | null;
          role?: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          login_method?: string | null;
          name?: string | null;
          role?: string;
          status?: string;
        };
        Relationships: [];
      };
      ai_states: {
        Row: {
          created_at: string;
          id: string;
          state_json: Json;
          timestamp: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          state_json: Json;
          timestamp: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          state_json?: Json;
          timestamp?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      marai_emotion_snapshots: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          proof: string;
          recorded_at: number;
          score: string;
          score_normalized: number;
          token_id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          proof: string;
          recorded_at: number;
          score: string;
          score_normalized: number;
          token_id: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          proof?: string;
          recorded_at?: number;
          score?: string;
          score_normalized?: number;
          token_id?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      user_design_profile: {
        Row: {
          design_dna: Json;
          engagement_score: string;
          evolution_stage: string;
          preferred_emotion: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          design_dna: Json;
          engagement_score?: string;
          evolution_stage?: string;
          preferred_emotion?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          design_dna?: Json;
          engagement_score?: string;
          evolution_stage?: string;
          preferred_emotion?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_design_profile_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      system_proposals: {
        Row: {
          affected_module: string;
          change_summary: string;
          confidence_score: string;
          created_at: string;
          expected_reward_gain: string;
          id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          affected_module: string;
          change_summary: string;
          confidence_score: string;
          created_at?: string;
          expected_reward_gain: string;
          id?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          affected_module?: string;
          change_summary?: string;
          confidence_score?: string;
          created_at?: string;
          expected_reward_gain?: string;
          id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      visual_lineage: {
        Row: {
          created_at: string;
          emotion: string;
          id: string;
          image_url: string;
          prompt: string;
          user_id: string;
          visual_seed: string;
        };
        Insert: {
          created_at?: string;
          emotion: string;
          id?: string;
          image_url: string;
          prompt: string;
          user_id: string;
          visual_seed: string;
        };
        Update: {
          created_at?: string;
          emotion?: string;
          id?: string;
          image_url?: string;
          prompt?: string;
          user_id?: string;
          visual_seed?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visual_lineage_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      quad_states: {
        Row: {
          cognition: number | null;
          design: number | null;
          emotion: number | null;
          metadata: Json | null;
          relationship: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cognition?: number | null;
          design?: number | null;
          emotion?: number | null;
          metadata?: Json | null;
          relationship?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cognition?: number | null;
          design?: number | null;
          emotion?: number | null;
          metadata?: Json | null;
          relationship?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      conversations_view: {
        Row: {
          id: string | null;
          last_message_preview: string | null;
          member_id: string | null;
          title: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
      feed_comments_view: {
        Row: {
          author_avatar: string | null;
          author_color: string | null;
          author_name: string | null;
          body: string | null;
          created_at: string | null;
          id: string | null;
          parent_author_avatar: string | null;
          parent_author_color: string | null;
          parent_author_name: string | null;
          parent_id: string | null;
          parent_user_id: string | null;
          post_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      followers_view: {
        Row: {
          created_at: string | null;
          follower_avatar: string | null;
          follower_color: string | null;
          follower_id: string | null;
          follower_name: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      following_view: {
        Row: {
          created_at: string | null;
          following_avatar: string | null;
          following_color: string | null;
          following_id: string | null;
          following_name: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      messages_view: {
        Row: {
          body: string | null;
          conversation_id: string | null;
          created_at: string | null;
          id: string | null;
          sender_avatar: string | null;
          sender_color: string | null;
          sender_id: string | null;
          sender_name: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      fetch_feed_with_engagement: {
        Args: {
          viewer_id: string;
        };
        Returns: {
          id: string;
          user_id: string;
          mirai_name: string | null;
          mood: string | null;
          message: string;
          music_url: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
          likes_count: number;
          viewer_has_liked: boolean;
          comments: Json;
        }[];
      };
      fetch_profile_feed: {
        Args: {
          target_user_id: string;
          viewer_id: string;
        };
        Returns: {
          id: string;
          user_id: string;
          mirai_name: string | null;
          mood: string | null;
          message: string;
          music_url: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
          likes_count: number;
          viewer_has_liked: boolean;
          comments: Json;
        }[];
      };
      search_directory: {
        Args: {
          search_term: string | null;
        };
        Returns: {
          href: string;
          id: string;
          subtitle: string;
          title: string;
          type: string;
        }[];
      };
      set_auth_user_metadata: {
        Args: {
          p_user_id: string;
          p_username: string | null;
          p_bio: string | null;
          p_accent_color: string | null;
          p_avatar_emoji: string | null;
          p_share_activity: boolean | null;
        };
        Returns: undefined;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};

export type PublicSchema = Database["public"];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: infer S }
    ? S extends keyof Database
      ? keyof Database[S]["Tables"]
      : never
    : never = never,
> = PublicTableNameOrOptions extends { schema: infer S }
  ? S extends keyof Database
    ? TableName extends keyof Database[S]["Tables"]
      ? Database[S]["Tables"][TableName] extends { Row: infer R }
        ? R
        : never
      : never
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: infer S }
    ? S extends keyof Database
      ? keyof Database[S]["Tables"]
      : never
    : never = never,
> = PublicTableNameOrOptions extends { schema: infer S }
  ? S extends keyof Database
    ? TableName extends keyof Database[S]["Tables"]
      ? Database[S]["Tables"][TableName] extends { Insert: infer I }
        ? I
        : never
      : never
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: infer S }
    ? S extends keyof Database
      ? keyof Database[S]["Tables"]
      : never
    : never = never,
> = PublicTableNameOrOptions extends { schema: infer S }
  ? S extends keyof Database
    ? TableName extends keyof Database[S]["Tables"]
      ? Database[S]["Tables"][TableName] extends { Update: infer U }
        ? U
        : never
      : never
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: infer S }
    ? S extends keyof Database
      ? keyof Database[S]["Enums"]
      : never
    : never = never,
> = PublicEnumNameOrOptions extends { schema: infer S }
  ? S extends keyof Database
    ? EnumName extends keyof Database[S]["Enums"]
      ? Database[S]["Enums"][EnumName]
      : never
    : never
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeName extends PublicCompositeNameOrOptions extends { schema: infer S }
    ? S extends keyof Database
      ? keyof Database[S]["CompositeTypes"]
      : never
    : never = never,
> = PublicCompositeNameOrOptions extends { schema: infer S }
  ? S extends keyof Database
    ? CompositeName extends keyof Database[S]["CompositeTypes"]
      ? Database[S]["CompositeTypes"][CompositeName]
      : never
    : never
  : PublicCompositeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeNameOrOptions]
    : never;

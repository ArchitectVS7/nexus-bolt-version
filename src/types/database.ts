export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          score: number;
          level: number;
          commands_executed: number;
          agents_deployed: number;
          achievements: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          score?: number;
          level?: number;
          commands_executed?: number;
          agents_deployed?: number;
          achievements?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          score?: number;
          level?: number;
          commands_executed?: number;
          agents_deployed?: number;
          achievements?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      custom_commands: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          syntax: string;
          description: string;
          parameters: any;
          effects: any;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          syntax: string;
          description: string;
          parameters: any;
          effects: any;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          syntax?: string;
          description?: string;
          parameters?: any;
          effects?: any;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      world_states: {
        Row: {
          id: string;
          user_id: string;
          agents: any;
          objects: any;
          world_size: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agents: any;
          objects: any;
          world_size: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agents?: any;
          objects?: any;
          world_size?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          objectives: any;
          reward: any;
          difficulty: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          objectives: any;
          reward: any;
          difficulty: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          objectives?: any;
          reward?: any;
          difficulty?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      world_templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          size: any;
          objects: any;
          spawn_points: any;
          difficulty: number;
          created_by: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          size: any;
          objects: any;
          spawn_points: any;
          difficulty: number;
          created_by: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          size?: any;
          objects?: any;
          spawn_points?: any;
          difficulty?: number;
          created_by?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      agent_scripts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          blocks: any;
          triggers: any;
          variables: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          blocks: any;
          triggers: any;
          variables: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          blocks?: any;
          triggers?: any;
          variables?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      llm_sessions: {
        Row: {
          id: string;
          user_id: string;
          messages: any;
          context: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          messages: any;
          context: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          messages?: any;
          context?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    challenges: {
      Row: {
        id: string;
        title: string;
        description: string;
        objectives: any;
        reward: any;
        difficulty: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        title: string;
        description: string;
        objectives: any;
        reward: any;
        difficulty: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        title?: string;
        description?: string;
        objectives?: any;
        reward?: any;
        difficulty?: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    };
    world_templates: {
      Row: {
        id: string;
        name: string;
        description: string;
        size: any;
        objects: any;
        spawn_points: any;
        difficulty: number;
        created_by: string;
        is_public: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        name: string;
        description: string;
        size: any;
        objects: any;
        spawn_points: any;
        difficulty: number;
        created_by: string;
        is_public?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        name?: string;
        description?: string;
        size?: any;
        objects?: any;
        spawn_points?: any;
        difficulty?: number;
        created_by?: string;
        is_public?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    };
    agent_scripts: {
      Row: {
        id: string;
        user_id: string;
        name: string;
        description: string;
        blocks: any;
        triggers: any;
        variables: any;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        name: string;
        description: string;
        blocks: any;
        triggers: any;
        variables: any;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        user_id?: string;
        name?: string;
        description?: string;
        blocks?: any;
        triggers?: any;
        variables?: any;
        created_at?: string;
        updated_at?: string;
      };
    };
    llm_sessions: {
      Row: {
        id: string;
        user_id: string;
        messages: any;
        context: any;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        messages: any;
        context: any;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        user_id?: string;
        messages?: any;
        context?: any;
        created_at?: string;
        updated_at?: string;
      };
    };
  };
}
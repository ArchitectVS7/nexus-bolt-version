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
    };
  };
}
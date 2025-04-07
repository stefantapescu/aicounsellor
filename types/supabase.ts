export interface Database {
  public: {
    Tables: {
      occupations: {
        Row: {
          code: string;
          title: string;
          description: string;
          tasks: {
            id: string;
            description: string;
            type: string;
            importance: number;
            frequency: number;
          }[];
          skills: {
            id: string;
            name: string;
            description: string;
            importance: number;
            level: number;
          }[];
          knowledge: {
            id: string;
            name: string;
            description: string;
            importance: number;
            level: number;
          }[];
          abilities: {
            id: string;
            name: string;
            description: string;
            importance: number;
            level: number;
          }[];
          work_context: {
            id: string;
            name: string;
            description: string;
            value: number;
          }[];
          work_values: {
            id: string;
            name: string;
            description: string;
            score: number;
          }[];
          interests: {
            id: string;
            name: string;
            description: string;
            score: number;
          }[];
          work_styles: {
            id: string;
            name: string;
            description: string;
            importance: number;
          }[];
          wages: {
            median: number;
            range: {
              low: number;
              high: number;
            };
            currency: string;
          };
          outlook: {
            growth_rate: number;
            projected_jobs: number;
            projected_annual_openings: number;
          };
          updated_at: string;
        };
        Insert: {
          code: string;
          title: string;
          description: string;
          tasks?: {
            id: string;
            description: string;
            type: string;
            importance: number;
            frequency: number;
          }[];
          skills?: {
            id: string;
            name: string;
            description: string;
            importance: number;
            level: number;
          }[];
          knowledge?: {
            id: string;
            name: string;
            description: string;
            importance: number;
            level: number;
          }[];
          abilities?: {
            id: string;
            name: string;
            description: string;
            importance: number;
            level: number;
          }[];
          work_context?: {
            id: string;
            name: string;
            description: string;
            value: number;
          }[];
          work_values?: {
            id: string;
            name: string;
            description: string;
            score: number;
          }[];
          interests?: {
            id: string;
            name: string;
            description: string;
            score: number;
          }[];
          work_styles?: {
            id: string;
            name: string;
            description: string;
            importance: number;
          }[];
          wages?: {
            median: number;
            range: {
              low: number;
              high: number;
            };
            currency: string;
          };
          outlook?: {
            growth_rate: number;
            projected_jobs: number;
            projected_annual_openings: number;
          };
          updated_at?: string;
        };
        Update: {
          code?: string;
          title?: string;
          description?: string;
          tasks?: {
            id: string;
            description: string;
            type: string;
            importance: number;
            frequency: number;
          }[];
          skills?: {
            id: string;
            name: string;
            description: string;
            importance: number;
            level: number;
          }[];
          knowledge?: {
            id: string;
            name: string;
            description: string;
            importance: number;
            level: number;
          }[];
          abilities?: {
            id: string;
            name: string;
            description: string;
            importance: number;
            level: number;
          }[];
          work_context?: {
            id: string;
            name: string;
            description: string;
            value: number;
          }[];
          work_values?: {
            id: string;
            name: string;
            description: string;
            score: number;
          }[];
          interests?: {
            id: string;
            name: string;
            description: string;
            score: number;
          }[];
          work_styles?: {
            id: string;
            name: string;
            description: string;
            importance: number;
          }[];
          wages?: {
            median: number;
            range: {
              low: number;
              high: number;
            };
            currency: string;
          };
          outlook?: {
            growth_rate: number;
            projected_jobs: number;
            projected_annual_openings: number;
          };
          updated_at?: string;
        };
      };
    };
  };
} 
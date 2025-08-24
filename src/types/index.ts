import { Database } from './database.types';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface Patient {
  name: string;
  age: number;
  symptoms: string;
}

export interface ExamAnalysis {
  id: string;
  patient: Patient;
  imageUrl: string;
  analysis: string;
  recommendations: string;
  createdAt: Date;
  status: 'analyzing' | 'completed' | 'error';
}

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthState {
  user: SupabaseUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

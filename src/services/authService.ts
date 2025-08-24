import { supabase } from '../lib/supabaseClient';
import { AuthError, AuthResponse, SignUpWithPasswordCredentials, signInWithPassword } from '@supabase/supabase-js';
import { Profile } from '../types';

export class AuthService {
  
  static onAuthStateChange(callback: (session: { user: any; profile: Profile | null }) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await this.getProfile(session.user.id);
        callback({ user: session.user, profile });
      } else {
        callback({ user: null, profile: null });
      }
    });
    return subscription;
  }

  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching profile:', error);
    }
    return data;
  }

  static async signUp(credentials: SignUpWithPasswordCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp(credentials);
    if (error) throw error;
    if (!data.user) throw new Error("Signup successful, but no user data returned.");
    return { data, error };
  }

  static async signIn(credentials: signInWithPassword): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    if (!data.user) throw new Error("Signin successful, but no user data returned.");
    return { data, error };
  }

  static async signOut(): Promise<{ error: AuthError | null }> {
    return supabase.auth.signOut();
  }
}

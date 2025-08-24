import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Mail, Lock, User as UserIcon, Eye, EyeOff, Stethoscope } from 'lucide-react';
import { AuthService } from '../services/authService';
import { Profile } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface LoginScreenProps {
  onLogin: (user: SupabaseUser, profile: Profile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      let authResponse;
      if (isLogin) {
        authResponse = await AuthService.signIn({ email: formData.email, password: formData.password });
      } else {
        authResponse = await AuthService.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });
      }
      
      if (authResponse.data.user) {
        const profile = await AuthService.getProfile(authResponse.data.user.id);
        if (profile) {
          onLogin(authResponse.data.user, profile);
        } else {
          // This might happen due to replication lag. Retry after a short delay.
          setTimeout(async () => {
             const freshProfile = await AuthService.getProfile(authResponse.data.user!.id);
             if(freshProfile) {
                onLogin(authResponse.data.user!, freshProfile);
             } else {
                setError("Não foi possível carregar o perfil do usuário.");
             }
          }, 2000);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Brain, text: 'IA Avançada para Análise Médica' },
    { icon: Activity, text: 'Laudos Precisos em Segundos' },
    { icon: Stethoscope, text: 'Tecnologia para Profissionais de Saúde' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div>
            <div className="flex items-center space-x-2 mb-4">
               <div className="relative">
                <Activity className="w-10 h-10 text-blue-600" />
                <Brain className="w-5 h-5 text-green-500 absolute -top-1 -right-1" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900">
                ALIA
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-gray-600">
              A <span className="text-green-600 font-semibold">IA de análise médica mais avançada</span> para profissionais de saúde.
            </p>
          </div>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * (index + 1), duration: 0.6 }}
                className="flex items-center space-x-4"
              >
                <div className="bg-green-100 p-3 rounded-lg">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-lg text-gray-800">{feature.text}</span>
              </motion.div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <p className="text-gray-700 text-lg leading-relaxed">
              "Revolucione sua prática médica com análises instantâneas e precisas. 
              Junte-se a mais de <span className="text-green-600 font-semibold">1.000 profissionais</span> 
              que já confiam na ALIA."
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Acesse sua conta' : 'Crie sua conta'}
            </h2>
            <p className="text-gray-600">
              {isLogin 
                ? 'Entre e comece a usar a IA mais avançada' 
                : 'Comece gratuitamente hoje mesmo'
              }
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Seu nome completo"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 mr-2" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white font-medium py-3 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </div>
              ) : (
                isLogin ? 'Entrar na ALIA' : 'Criar conta gratuita'
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-green-600 hover:text-green-700 transition-colors font-medium"
            >
              {isLogin 
                ? 'Não tem conta? Criar conta gratuita' 
                : 'Já tem conta? Fazer login'
              }
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default LoginScreen;

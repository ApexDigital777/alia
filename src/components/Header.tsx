import React from 'react';
import { Activity, Brain, Crown, LogOut, User as UserIcon } from 'lucide-react';
import { Profile } from '../types';

interface HeaderProps {
  profile?: Profile | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ profile, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Activity className="w-8 h-8 text-blue-600" />
                <Brain className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ALIA</h1>
                <p className="text-xs text-gray-500 -mt-1">Análise Médica IA</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {profile ? (
              <>
                <div className="hidden sm:block text-right">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                      <div className="flex items-center space-x-1">
                        {profile.plan === 'premium' ? (
                          <>
                            <Crown className="w-3 h-3 text-yellow-600" />
                            <span className="text-xs text-yellow-600 font-medium">Premium</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">Gratuito</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Sair</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">Sistema de Análise</p>
                  <p className="text-xs text-gray-500">Inteligência Artificial Avançada</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

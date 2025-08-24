import React from 'react';
import { Activity, Brain } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Activity className="w-8 h-8 text-blue-600" />
                <Brain className="w-4 h-4 text-blue-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ALIA</h1>
                <p className="text-xs text-gray-500 -mt-1">Análise Médica IA</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">Sistema de Análise</p>
              <p className="text-xs text-gray-500">Powered by Gemini AI</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

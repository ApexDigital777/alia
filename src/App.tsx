import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import UpgradeScreen from './components/UpgradeScreen';
import PatientForm from './components/PatientForm';
import LoadingAnalysis from './components/LoadingAnalysis';
import AnalysisResult from './components/AnalysisResult';
import { analyzeExam } from './services/geminiService';
import { AuthService } from './services/authService';
import { AnalysisService } from './services/analysisService';
import { Patient, ExamAnalysis, AuthState, Profile } from './types';
import { User as SupabaseUser } from '@supabase/supabase-js';

type AppState = 'login' | 'form' | 'analyzing' | 'result' | 'error' | 'upgrade';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [currentAnalysis, setCurrentAnalysis] = useState<ExamAnalysis | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const subscription = AuthService.onAuthStateChange(({ user, profile }) => {
      setAuthState({
        user,
        profile,
        isAuthenticated: !!user,
        isLoading: false,
      });
      setAppState(user ? 'form' : 'login');
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      alert('Pagamento bem-sucedido! Bem-vindo ao Plano Premium.');
      // Refresh profile data
      if (authState.user) {
         AuthService.getProfile(authState.user.id).then(profile => {
            setAuthState(prev => ({...prev, profile}));
         });
      }
      window.history.replaceState(null, '', window.location.pathname);
    } else if (urlParams.get('payment') === 'cancelled') {
        alert('Pagamento cancelado. Você pode tentar novamente a qualquer momento.');
        window.history.replaceState(null, '', window.location.pathname);
    }


    return () => {
      subscription?.unsubscribe();
    };
  }, [authState.user]);

  const handleLogin = (user: SupabaseUser, profile: Profile) => {
    setAuthState({
      user,
      profile,
      isAuthenticated: true,
      isLoading: false,
    });
    setAppState('form');
  };

  const handleLogout = async () => {
    await AuthService.signOut();
    setAuthState({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setCurrentAnalysis(null);
    setError('');
    setAppState('login');
  };

  const handleUpgradeRequired = () => {
    setAppState('upgrade');
  };

  const handleUpgrade = (profile: Profile) => {
    setAuthState(prev => ({
      ...prev,
      profile,
    }));
    setAppState('form');
  };

  const handleBackToForm = () => {
    setAppState('form');
  };

  const handleAnalyzeExam = async (patient: Patient, imageFile: File) => {
    if (!authState.user || !authState.profile || authState.profile.plan === 'free') {
      handleUpgradeRequired();
      return;
    }

    setAppState('analyzing');
    setError('');

    try {
      const geminiResult = await analyzeExam(
        imageFile,
        patient.name,
        patient.age,
        patient.symptoms
      );

      const imageUrl = await AnalysisService.uploadExamImage(authState.user.id, imageFile);

      const analysis: ExamAnalysis = {
        id: Date.now().toString(),
        patient,
        imageUrl: URL.createObjectURL(imageFile), // For local preview
        analysis: geminiResult.analysis,
        recommendations: geminiResult.recommendations,
        createdAt: new Date(),
        status: 'completed',
      };

      await AnalysisService.saveAnalysis(authState.user.id, analysis, imageUrl);

      setCurrentAnalysis(analysis);
      setAppState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setAppState('error');
    }
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setError('');
    setAppState('form');
  };

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated || !authState.user || !authState.profile) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (appState === 'upgrade') {
    return (
      <UpgradeScreen 
        profile={authState.profile}
        onUpgrade={handleUpgrade}
        onBack={handleBackToForm}
      />
    );
  }

  const renderContent = () => {
    switch (appState) {
      case 'form':
        return (
          <PatientForm
            profile={authState.profile!}
            onSubmit={handleAnalyzeExam}
            onUpgradeRequired={handleUpgradeRequired}
            isAnalyzing={false}
          />
        );
      
      case 'analyzing':
        return <LoadingAnalysis />;
      
      case 'result':
        return currentAnalysis ? (
          <AnalysisResult
            analysis={currentAnalysis}
            onNewAnalysis={handleNewAnalysis}
          />
        ) : null;
      
      case 'error':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erro na Análise</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleNewAnalysis}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header profile={authState.profile} onLogout={handleLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              ALIA - Plataforma de Análise Médica com Inteligência Artificial
            </p>
            <p className="text-sm text-gray-500 mb-2">
              © 2025 ALIA. Desenvolvido para auxiliar profissionais de saúde com tecnologia de ponta.
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Desenvolvido por </span>
              <a 
                href="https://axiomind.space" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                Axiomind.space
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

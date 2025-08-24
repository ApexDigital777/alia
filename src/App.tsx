import React, { useState } from 'react';
import Header from './components/Header';
import PatientForm from './components/PatientForm';
import LoadingAnalysis from './components/LoadingAnalysis';
import AnalysisResult from './components/AnalysisResult';
import { analyzeExam } from './services/geminiService';
import { Patient, ExamAnalysis } from './types';

type AppState = 'form' | 'analyzing' | 'result' | 'error';

function App() {
  const [state, setState] = useState<AppState>('form');
  const [currentAnalysis, setCurrentAnalysis] = useState<ExamAnalysis | null>(null);
  const [error, setError] = useState<string>('');

  const handleAnalyzeExam = async (patient: Patient, imageFile: File) => {
    setState('analyzing');
    setError('');

    try {
      const result = await analyzeExam(
        imageFile,
        patient.name,
        patient.age,
        patient.symptoms
      );

      const analysis: ExamAnalysis = {
        id: Date.now().toString(),
        patient,
        imageUrl: URL.createObjectURL(imageFile),
        analysis: result.analysis,
        recommendations: result.recommendations,
        createdAt: new Date(),
        status: 'completed'
      };

      setCurrentAnalysis(analysis);
      setState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setState('error');
    }
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setError('');
    setState('form');
  };

  const renderContent = () => {
    switch (state) {
      case 'form':
        return (
          <PatientForm
            onSubmit={handleAnalyzeExam}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              ALIA - Plataforma de Análise Médica com Inteligência Artificial
            </p>
            <p className="text-sm text-gray-500">
              © 2025 ALIA. Desenvolvido para auxiliar profissionais de saúde com tecnologia de ponta.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

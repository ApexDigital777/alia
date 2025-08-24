import React from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Calendar, Stethoscope, CheckCircle, AlertTriangle, Download, FileDown } from 'lucide-react';
import { ExamAnalysis } from '../types';
import { formatTextForDisplay } from '../utils/textFormatter';
import { generateCompletePDFReport, generateAnalysisPDF, generateRecommendationsPDF } from '../utils/pdfGenerator';

interface AnalysisResultProps {
  analysis: ExamAnalysis;
  onNewAnalysis: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, onNewAnalysis }) => {
  const handleDownloadComplete = () => {
    try {
      generateCompletePDFReport(analysis);
    } catch (error) {
      console.error('Erro ao gerar PDF completo:', error);
      alert('Erro ao gerar o relatório PDF. Tente novamente.');
    }
  };

  const handleDownloadAnalysis = () => {
    try {
      generateAnalysisPDF(analysis);
    } catch (error) {
      console.error('Erro ao gerar PDF da análise:', error);
      alert('Erro ao gerar o PDF da análise. Tente novamente.');
    }
  };

  const handleDownloadRecommendations = () => {
    try {
      generateRecommendationsPDF(analysis);
    } catch (error) {
      console.error('Erro ao gerar PDF das recomendações:', error);
      alert('Erro ao gerar o PDF das recomendações. Tente novamente.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Análise Concluída</h2>
            </div>
            <p className="opacity-90">Laudo gerado com sucesso pela IA</p>
          </div>
          <FileText className="w-8 h-8 opacity-80" />
        </div>
      </div>

      {/* Patient Info */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Paciente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="font-medium text-gray-900">{analysis.patient.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Idade</p>
              <p className="font-medium text-gray-900">{analysis.patient.age} anos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Sintomas</p>
              <p className="font-medium text-gray-900">
                {analysis.patient.symptoms || 'Não informado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Content */}
      <div className="p-6 space-y-6">
        {/* Análise Técnica */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Análise Técnica
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: formatTextForDisplay(analysis.analysis) 
              }}
            />
          </div>
        </div>

        {/* Recomendações */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Recomendações
          </h3>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: formatTextForDisplay(analysis.recommendations) 
              }}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">Aviso Importante</h4>
              <p className="text-sm text-red-800">
                Esta análise foi gerada por inteligência artificial e serve apenas como auxílio diagnóstico. 
                <strong> NÃO substitui a avaliação de um médico especialista.</strong> Sempre consulte um 
                profissional médico qualificado para diagnóstico e tratamento definitivos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <button
              onClick={handleDownloadComplete}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Laudo Completo
            </button>
            
            <button
              onClick={onNewAnalysis}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Nova Análise
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadAnalysis}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Baixar Apenas Análise
            </button>
            
            <button
              onClick={handleDownloadRecommendations}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Baixar Apenas Recomendações
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisResult;

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Calendar, Stethoscope, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { ExamAnalysis } from '../types';

interface AnalysisResultProps {
  analysis: ExamAnalysis;
  onNewAnalysis: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, onNewAnalysis }) => {
  const handleDownloadReport = () => {
    const reportContent = `
LAUDO MÉDICO - ANÁLISE POR IA
================================

DADOS DO PACIENTE:
Nome: ${analysis.patient.name}
Idade: ${analysis.patient.age} anos
Sintomas: ${analysis.patient.symptoms || 'Não informado'}
Data do Exame: ${analysis.createdAt.toLocaleDateString('pt-BR')}

ANÁLISE TÉCNICA:
${analysis.analysis}

RECOMENDAÇÕES:
${analysis.recommendations}

________________________________
IMPORTANTE: Esta análise foi gerada por inteligência artificial e serve apenas como auxílio diagnóstico. 
NÃO substitui a avaliação de um médico especialista. Sempre consulte um profissional médico qualificado 
para diagnóstico e tratamento definitivos.

Gerado pela Plataforma ALIA
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laudo_${analysis.patient.name.replace(/\s+/g, '_')}_${analysis.createdAt.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {analysis.analysis}
            </p>
          </div>
        </div>

        {/* Recomendações */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Recomendações
          </h3>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {analysis.recommendations}
            </p>
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
      <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-between">
        <button
          onClick={handleDownloadReport}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar Laudo
        </button>
        
        <button
          onClick={onNewAnalysis}
          className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Nova Análise
        </button>
      </div>
    </motion.div>
  );
};

export default AnalysisResult;

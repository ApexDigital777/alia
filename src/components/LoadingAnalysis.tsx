import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Zap } from 'lucide-react';

const LoadingAnalysis: React.FC = () => {
  const steps = [
    { icon: Activity, text: 'Processando imagem...', delay: 0 },
    { icon: Brain, text: 'Analisando com IA...', delay: 1 },
    { icon: Zap, text: 'Gerando laudo...', delay: 2 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-8 text-center"
    >
      <div className="mb-8">
        <div className="relative mx-auto w-20 h-20 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analisando Exame</h2>
        <p className="text-gray-600">Nossa IA está processando o exame e gerando o laudo médico</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.delay, duration: 0.5 }}
            className="flex items-center justify-center space-x-3 p-3 bg-blue-50 rounded-lg"
          >
            <step.icon className="w-5 h-5 text-blue-600" />
            <span className="text-gray-800 font-medium">{step.text}</span>
            
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: step.delay }}
              className="w-2 h-2 bg-blue-600 rounded-full"
            />
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>Tempo estimado: 30-60 segundos</p>
      </div>
    </motion.div>
  );
};

export default LoadingAnalysis;

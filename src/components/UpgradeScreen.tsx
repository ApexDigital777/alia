import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, ArrowLeft, BarChart, FileDown, MessageSquareHeart, ShieldCheck } from 'lucide-react';
import { Profile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

interface UpgradeScreenProps {
  profile: Profile;
  onUpgrade: (profile: Profile) => void;
  onBack: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ profile, onUpgrade, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session');

      if (functionError) {
        throw functionError;
      }
      
      const { sessionId } = data;
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
        if (stripeError) {
          throw stripeError;
        }
      } else {
        throw new Error("Stripe.js não foi carregado.");
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar o pagamento.';
      console.error("Upgrade Error:", message);
      setError(`Falha ao redirecionar para o pagamento: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const premiumFeatures = [
    { icon: Zap, text: '100 análises com IA por mês' },
    { icon: FileDown, text: 'Laudos completos em PDF' },
    { icon: BarChart, text: 'Relatórios avançados' },
    { icon: MessageSquareHeart, text: 'Suporte prioritário 24/7' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao sistema
          </button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Eleve sua Prática Médica
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Faça o upgrade para o <strong>Plano Premium</strong> e tenha acesso total à plataforma de análise médica mais avançada.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <Crown className="w-8 h-8 mr-3 text-yellow-500" />
                Plano Premium
              </h2>
              <p className="text-gray-600">Acesso completo e ilimitado.</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-4xl font-bold text-green-600">R$ 69,90</p>
              <p className="text-gray-500">por mês</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">O que está incluso:</h3>
            <ul className="space-y-4">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4">
                    <feature.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 mt-1">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Aguarde...
              </div>
            ) : (
              <>
                <Zap className="w-5 h-5 inline mr-2" />
                Fazer Upgrade com Stripe
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
              Pagamento seguro via Stripe. Cancele a qualquer momento.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UpgradeScreen;

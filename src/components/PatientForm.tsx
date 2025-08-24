import React, { useState } from 'react';
import { User, Calendar, Stethoscope, Upload, Send, AlertCircle, Crown } from 'lucide-react';
import { Patient, Profile } from '../types';

interface PatientFormProps {
  profile: Profile;
  onSubmit: (patient: Patient, imageFile: File) => void;
  onUpgradeRequired: () => void;
  isAnalyzing: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ profile, onSubmit, onUpgradeRequired, isAnalyzing }) => {
  const [patient, setPatient] = useState<Patient>({
    name: '',
    age: 0,
    symptoms: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors({ ...errors, image: 'Arquivo muito grande. Máximo 10MB.' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Por favor, selecione apenas arquivos de imagem.' });
        return;
      }

      setImageFile(file);
      setErrors({ ...errors, image: '' });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!patient.name.trim()) {
      newErrors.name = 'Nome do paciente é obrigatório';
    }

    if (!patient.age || patient.age < 1 || patient.age > 150) {
      newErrors.age = 'Idade deve estar entre 1 e 150 anos';
    }

    if (!imageFile) {
      newErrors.image = 'Imagem do exame é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile.plan === 'free') {
      onUpgradeRequired();
      return;
    }
    
    if (validateForm() && imageFile) {
      onSubmit(patient, imageFile);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Novo Exame</h2>
            <p className="text-gray-600">Insira os dados do paciente e faça upload do exame para análise</p>
          </div>
          
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            profile.plan === 'premium' 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
              : 'bg-gray-100 text-gray-800 border border-gray-300'
          }`}>
            {profile.plan === 'premium' ? (
              <div className="flex items-center">
                <Crown className="w-4 h-4 mr-1" />
                Premium
              </div>
            ) : (
              'Gratuito'
            )}
          </div>
        </div>

        {profile.plan === 'free' && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">Plano Gratuito</h4>
                <p className="text-sm text-orange-800">
                  Você está no plano gratuito. Para realizar análises com nossa IA avançada, 
                  faça upgrade para o <strong>Plano Premium</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 mr-2" />
            Nome do Paciente *
          </label>
          <input
            type="text"
            value={patient.name}
            onChange={(e) => setPatient({ ...patient, name: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite o nome completo do paciente"
            disabled={isAnalyzing}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            Idade *
          </label>
          <input
            type="number"
            value={patient.age || ''}
            onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) || 0 })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.age ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Idade do paciente"
            min="1"
            max="150"
            disabled={isAnalyzing}
          />
          {errors.age && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.age}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Stethoscope className="w-4 h-4 mr-2" />
            Sintomas (opcional)
          </label>
          <textarea
            value={patient.symptoms}
            onChange={(e) => setPatient({ ...patient, symptoms: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Descreva os sintomas relatados pelo paciente..."
            rows={3}
            disabled={isAnalyzing}
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Upload className="w-4 h-4 mr-2" />
            Imagem do Exame *
          </label>
          
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            errors.image ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400'
          }`}>
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Preview do exame"
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setErrors({ ...errors, image: '' });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  disabled={isAnalyzing}
                >
                  Trocar imagem
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Clique para fazer upload ou arraste a imagem</p>
                <p className="text-sm text-gray-500">PNG, JPG, JPEG até 10MB</p>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="exam-image"
              disabled={isAnalyzing}
            />
            
            {!imagePreview && (
              <label
                htmlFor="exam-image"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Selecionar Arquivo
              </label>
            )}
          </div>
          
          {errors.image && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.image}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isAnalyzing}
          className={`w-full flex items-center justify-center px-6 py-3 font-medium rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            profile.plan === 'premium'
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 focus:ring-yellow-500'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Analisando Exame...
            </>
          ) : profile.plan === 'premium' ? (
            <>
              <Send className="w-5 h-5 mr-2" />
              Analisar Exame
            </>
          ) : (
            <>
              <Crown className="w-5 h-5 mr-2" />
              Fazer Upgrade para Analisar
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;

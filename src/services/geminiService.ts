import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AnalysisResult {
  analysis: string;
  recommendations: string;
}

export async function analyzeExam(
  imageFile: File,
  patientName: string,
  age: number,
  symptoms: string
): Promise<AnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert image to base64
    const imageBase64 = await fileToBase64(imageFile);
    
    const prompt = `
Você é um assistente médico especializado em análise de exames de imagem. 
Analise cuidadosamente o exame médico fornecido e forneça uma análise técnica detalhada.

Dados do Paciente:
- Nome: ${patientName}
- Idade: ${age} anos
- Sintomas relatados: ${symptoms || 'Não informado'}

Por favor, forneça:

1. ANÁLISE TÉCNICA:
- Descrição detalhada dos achados no exame
- Identificação de estruturas anatômicas visíveis
- Observações sobre normalidades e anormalidades
- Avaliação da qualidade técnica do exame

2. RECOMENDAÇÕES:
- Sugestões de conduta médica
- Necessidade de exames complementares
- Acompanhamento recomendado
- Orientações gerais

IMPORTANTE: Esta análise é apenas um auxílio diagnóstico e NÃO substitui a avaliação de um médico especialista. Sempre consulte um profissional médico qualificado para diagnóstico e tratamento definitivos.

Formate a resposta de forma clara e profissional, adequada para uso médico.
    `;

    const imagePart = {
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType: imageFile.type,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract analysis and recommendations
    const sections = text.split(/(?:2\.\s*RECOMENDAÇÕES|RECOMENDAÇÕES)/i);
    
    return {
      analysis: sections[0]?.replace(/1\.\s*ANÁLISE TÉCNICA:?/i, '').trim() || text,
      recommendations: sections[1]?.trim() || 'Consulte um médico especialista para orientações específicas.'
    };

  } catch (error) {
    console.error('Erro ao analisar exame:', error);
    throw new Error('Erro ao processar análise do exame. Tente novamente.');
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

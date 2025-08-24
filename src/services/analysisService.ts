import { supabase } from '../lib/supabaseClient';
import { ExamAnalysis, Patient } from '../types';

export class AnalysisService {
  static async uploadExamImage(userId: string, imageFile: File): Promise<string> {
    const filePath = `${userId}/${Date.now()}_${imageFile.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('exam_images')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error('Falha ao fazer upload da imagem do exame.');
    }

    const { data } = supabase.storage
      .from('exam_images')
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error('Não foi possível obter a URL pública da imagem.');
    }
    
    return data.publicUrl;
  }

  static async saveAnalysis(userId: string, analysis: ExamAnalysis, imageUrl: string): Promise<any> {
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: userId,
        patient_name: analysis.patient.name,
        patient_age: analysis.patient.age,
        patient_symptoms: analysis.patient.symptoms,
        image_url: imageUrl,
        analysis_text: analysis.analysis,
        recommendations_text: analysis.recommendations,
      });

    if (error) {
      console.error('Error saving analysis:', error);
      throw new Error('Falha ao salvar a análise no banco de dados.');
    }

    return data;
  }
}

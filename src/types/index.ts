export interface Patient {
  name: string;
  age: number;
  symptoms: string;
}

export interface ExamAnalysis {
  id: string;
  patient: Patient;
  imageUrl: string;
  analysis: string;
  recommendations: string;
  createdAt: Date;
  status: 'analyzing' | 'completed' | 'error';
}

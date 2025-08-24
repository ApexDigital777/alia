import jsPDF from 'jspdf';
import { ExamAnalysis } from '../types';
import { formatTextForPDF } from './textFormatter';

// Helper function to add text with automatic line breaks and better fitting
const addTextToPDF = (
  pdf: jsPDF, 
  text: string, 
  startY: number, 
  margin: number, 
  contentWidth: number, 
  fontSize: number = 9, 
  isBold: boolean = false, 
  leftMargin: number = 0,
  maxHeight: number = 200
) => {
  pdf.setFontSize(fontSize);
  pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
  
  const lines = pdf.splitTextToSize(text, contentWidth - leftMargin);
  let yPosition = startY;
  const lineHeight = fontSize * 1.2;
  
  for (let i = 0; i < lines.length && yPosition < maxHeight; i++) {
    pdf.text(lines[i], margin + leftMargin, yPosition);
    yPosition += lineHeight;
  }
  
  return yPosition;
};

// Common PDF header - more compact
const addPDFHeader = (pdf: jsPDF, title: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;

  // Header with logo area - more compact
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ALIA', margin, 15);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Plataforma de Análise Médica com IA', margin, 21);
  
  // Title - more compact
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, 38);
  
  return 48; // Return starting Y position for content
};

// Common PDF footer - more compact
const addPDFFooter = (pdf: jsPDF, analysis: ExamAnalysis) => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  
  const footerY = pageHeight - 15;
  pdf.text(`${analysis.patient.name} | ${analysis.patient.age} anos | ${analysis.createdAt.toLocaleDateString('pt-BR')}`, margin, footerY);
  
  // Axiomind.space link - centered
  const linkText = 'Desenvolvido por Axiomind.space';
  const linkWidth = pdf.getStringUnitWidth(linkText) * 7 / pdf.internal.scaleFactor;
  const linkX = (pageWidth - linkWidth) / 2;
  
  pdf.setTextColor(59, 130, 246);
  pdf.textWithLink(linkText, linkX, footerY + 5, { url: 'https://axiomind.space' });
};

// Generate complete PDF report - optimized for single page
export function generateCompletePDFReport(analysis: ExamAnalysis): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - (2 * margin);

  let yPosition = addPDFHeader(pdf, 'LAUDO MÉDICO COMPLETO');

  // Patient Information Box - very compact
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, yPosition, contentWidth, 18, 'FD');
  
  yPosition += 6;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PACIENTE:', margin + 3, yPosition);
  
  yPosition += 4;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  const patientInfo = `${analysis.patient.name} | ${analysis.patient.age} anos | Sintomas: ${analysis.patient.symptoms || 'Não informado'}`;
  const patientLines = pdf.splitTextToSize(patientInfo, contentWidth - 6);
  for (let i = 0; i < Math.min(patientLines.length, 2); i++) {
    pdf.text(patientLines[i], margin + 3, yPosition);
    yPosition += 4;
  }
  
  yPosition += 5;

  // Calculate available space for content
  const footerSpace = 25;
  const disclaimerSpace = 20;
  const availableHeight = pageHeight - yPosition - footerSpace - disclaimerSpace;
  const analysisHeight = availableHeight * 0.55;
  const recommendationsHeight = availableHeight * 0.45;

  // Analysis Section - compact
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ANÁLISE TÉCNICA', margin, yPosition);
  yPosition += 6;
  
  const formattedAnalysis = formatTextForPDF(analysis.analysis);
  const analysisEndY = addTextToPDF(pdf, formattedAnalysis, yPosition, margin, contentWidth, 7, false, 2, yPosition + analysisHeight);
  yPosition = Math.min(analysisEndY + 5, yPosition + analysisHeight + 5);

  // Recommendations Section - compact
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RECOMENDAÇÕES', margin, yPosition);
  yPosition += 6;
  
  const formattedRecommendations = formatTextForPDF(analysis.recommendations);
  const recommendationsEndY = addTextToPDF(pdf, formattedRecommendations, yPosition, margin, contentWidth, 7, false, 2, yPosition + recommendationsHeight);
  yPosition = Math.min(recommendationsEndY + 8, yPosition + recommendationsHeight + 8);

  // Important Notice Box - very compact at bottom
  const disclaimerY = pageHeight - footerSpace - disclaimerSpace;
  pdf.setDrawColor(239, 68, 68);
  pdf.setFillColor(254, 242, 242);
  pdf.rect(margin, disclaimerY, contentWidth, 15, 'FD');
  
  pdf.setTextColor(185, 28, 28);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AVISO:', margin + 3, disclaimerY + 5);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  const disclaimer = 'Esta análise foi gerada por IA e serve apenas como auxílio diagnóstico. NÃO substitui a avaliação médica especializada.';
  const disclaimerLines = pdf.splitTextToSize(disclaimer, contentWidth - 6);
  for (let i = 0; i < Math.min(disclaimerLines.length, 2); i++) {
    pdf.text(disclaimerLines[i], margin + 3, disclaimerY + 8 + (i * 3));
  }

  pdf.setTextColor(0, 0, 0); // Reset color
  addPDFFooter(pdf, analysis);

  const fileName = `Laudo_Completo_${analysis.patient.name.replace(/\s+/g, '_')}_${analysis.createdAt.toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

// Generate analysis-only PDF - optimized for single page
export function generateAnalysisPDF(analysis: ExamAnalysis): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - (2 * margin);

  let yPosition = addPDFHeader(pdf, 'ANÁLISE TÉCNICA DO EXAME');

  // Patient Information Box - compact
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, yPosition, contentWidth, 18, 'FD');
  
  yPosition += 6;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PACIENTE:', margin + 3, yPosition);
  
  yPosition += 4;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  const patientInfo = `${analysis.patient.name} | ${analysis.patient.age} anos | Sintomas: ${analysis.patient.symptoms || 'Não informado'}`;
  const patientLines = pdf.splitTextToSize(patientInfo, contentWidth - 6);
  for (let i = 0; i < Math.min(patientLines.length, 2); i++) {
    pdf.text(patientLines[i], margin + 3, yPosition);
    yPosition += 4;
  }
  
  yPosition += 8;

  // Analysis Section - expanded to fill available space
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ANÁLISE TÉCNICA DETALHADA', margin, yPosition);
  yPosition += 8;
  
  const formattedAnalysis = formatTextForPDF(analysis.analysis);
  const footerSpace = 20;
  const maxContentHeight = pageHeight - yPosition - footerSpace;
  
  addTextToPDF(pdf, formattedAnalysis, yPosition, margin, contentWidth, 8, false, 0, yPosition + maxContentHeight);

  addPDFFooter(pdf, analysis);

  const fileName = `Analise_${analysis.patient.name.replace(/\s+/g, '_')}_${analysis.createdAt.toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

// Generate recommendations-only PDF - optimized for single page
export function generateRecommendationsPDF(analysis: ExamAnalysis): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - (2 * margin);

  let yPosition = addPDFHeader(pdf, 'RECOMENDAÇÕES MÉDICAS');

  // Patient Information Box - compact
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, yPosition, contentWidth, 18, 'FD');
  
  yPosition += 6;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PACIENTE:', margin + 3, yPosition);
  
  yPosition += 4;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  const patientInfo = `${analysis.patient.name} | ${analysis.patient.age} anos | Sintomas: ${analysis.patient.symptoms || 'Não informado'}`;
  const patientLines = pdf.splitTextToSize(patientInfo, contentWidth - 6);
  for (let i = 0; i < Math.min(patientLines.length, 2); i++) {
    pdf.text(patientLines[i], margin + 3, yPosition);
    yPosition += 4;
  }
  
  yPosition += 8;

  // Recommendations Section
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RECOMENDAÇÕES DETALHADAS', margin, yPosition);
  yPosition += 8;
  
  const formattedRecommendations = formatTextForPDF(analysis.recommendations);
  const disclaimerSpace = 25;
  const footerSpace = 20;
  const maxContentHeight = pageHeight - yPosition - disclaimerSpace - footerSpace;
  
  const recommendationsEndY = addTextToPDF(pdf, formattedRecommendations, yPosition, margin, contentWidth, 8, false, 0, yPosition + maxContentHeight);
  
  // Important Notice Box - compact at bottom
  const disclaimerY = pageHeight - footerSpace - disclaimerSpace;
  pdf.setDrawColor(239, 68, 68);
  pdf.setFillColor(254, 242, 242);
  pdf.rect(margin, disclaimerY, contentWidth, 20, 'FD');
  
  pdf.setTextColor(185, 28, 28);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AVISO IMPORTANTE', margin + 3, disclaimerY + 6);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const disclaimer = 'Estas recomendações foram geradas por IA e servem apenas como auxílio médico. Sempre consulte um profissional médico qualificado.';
  const disclaimerLines = pdf.splitTextToSize(disclaimer, contentWidth - 6);
  for (let i = 0; i < Math.min(disclaimerLines.length, 2); i++) {
    pdf.text(disclaimerLines[i], margin + 3, disclaimerY + 10 + (i * 3));
  }

  pdf.setTextColor(0, 0, 0); // Reset color
  addPDFFooter(pdf, analysis);

  const fileName = `Recomendacoes_${analysis.patient.name.replace(/\s+/g, '_')}_${analysis.createdAt.toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

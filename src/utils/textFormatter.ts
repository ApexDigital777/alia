// Utility functions for text formatting
export function formatTextForDisplay(text: string): string {
  // Remove asterisks and format for HTML display
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **text** -> <strong>text</strong>
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *text* -> <em>text</em>
    .replace(/\n/g, '<br>') // Line breaks
    .replace(/(\d+\.)\s/g, '<br><strong>$1</strong> ') // Numbered lists
    .replace(/(-\s)/g, '<br>• '); // Bullet points
}

export function formatTextForPDF(text: string): string {
  // Clean text for PDF generation, removing markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** but keep content
    .replace(/\*(.*?)\*/g, '$1') // Remove * but keep content
    .replace(/\n\n/g, '\n') // Remove extra line breaks
    .trim();
}

export function splitTextIntoLines(text: string, maxWidth: number, fontSize: number = 12): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  // Approximate character width (this is a rough estimate)
  const charWidth = fontSize * 0.6;
  const maxCharsPerLine = Math.floor(maxWidth / charWidth);
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is too long, force break
        lines.push(word);
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

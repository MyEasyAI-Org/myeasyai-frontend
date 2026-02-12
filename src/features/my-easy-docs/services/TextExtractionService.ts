// =============================================
// MyEasyDocs - Text Extraction Service
// Extracts text from PDF, DOCX, and plain text files
// =============================================

import { extractText } from 'unpdf';
import mammoth from 'mammoth';

/**
 * MIME types that support text extraction
 */
const EXTRACTABLE_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'text/html',
  'text/xml',
  'application/xml',
];

/**
 * Result of text extraction
 */
export interface TextExtractionResult {
  text: string;
  wordCount: number;
}

export const TextExtractionService = {
  /**
   * Verifica se o tipo MIME suporta extração de texto
   * @param mimeType - Tipo MIME do arquivo
   */
  canExtract(mimeType: string): boolean {
    return EXTRACTABLE_MIME_TYPES.includes(mimeType);
  },

  /**
   * Extrai texto de um arquivo PDF
   * @param blob - Blob ou File do PDF
   */
  async extractFromPdf(blob: Blob): Promise<string> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const result = await extractText(arrayBuffer, { mergePages: true });

      // Result format: { totalPages: number, text: string } when mergePages: true
      // Cast to access properties safely
      const pdfResult = result as { totalPages: number; text: string | string[] };

      if (typeof pdfResult.text === 'string') {
        return pdfResult.text.trim();
      }

      if (Array.isArray(pdfResult.text)) {
        return pdfResult.text.join('\n\n').trim();
      }

      // Fallback for unexpected format
      return '';
    } catch (error) {
      console.error('[TextExtractionService] PDF extraction failed:', error);
      throw new Error('Falha ao extrair texto do PDF');
    }
  },

  /**
   * Extrai texto de um arquivo DOCX
   * @param blob - Blob ou File do DOCX
   */
  async extractFromDocx(blob: Blob): Promise<string> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });

      if (result.messages.length > 0) {
        console.warn('[TextExtractionService] DOCX warnings:', result.messages);
      }

      return result.value.trim();
    } catch (error) {
      console.error('[TextExtractionService] DOCX extraction failed:', error);
      throw new Error('Falha ao extrair texto do DOCX');
    }
  },

  /**
   * Extrai texto de um arquivo de texto puro
   * @param blob - Blob ou File do arquivo de texto
   */
  async extractFromText(blob: Blob): Promise<string> {
    try {
      const text = await blob.text();
      return text.trim();
    } catch (error) {
      console.error('[TextExtractionService] Text extraction failed:', error);
      throw new Error('Falha ao ler arquivo de texto');
    }
  },

  /**
   * Extrai texto de qualquer arquivo suportado
   * @param file - File ou Blob a processar
   * @param mimeType - Tipo MIME do arquivo
   * @returns Texto extraído e contagem de palavras
   */
  async extract(file: File | Blob, mimeType: string): Promise<TextExtractionResult> {
    if (!this.canExtract(mimeType)) {
      throw new Error(`Tipo de arquivo não suportado para extração: ${mimeType}`);
    }

    let text: string;

    // Route to appropriate extractor
    if (mimeType === 'application/pdf') {
      text = await this.extractFromPdf(file);
    } else if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      text = await this.extractFromDocx(file);
    } else {
      // Plain text, markdown, csv, json, html, xml
      text = await this.extractFromText(file);
    }

    // Calculate word count
    const wordCount = this.countWords(text);

    return { text, wordCount };
  },

  /**
   * Conta palavras em um texto
   * @param text - Texto a contar
   */
  countWords(text: string): number {
    if (!text || text.trim() === '') {
      return 0;
    }

    // Split by whitespace and filter empty strings
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  },

  /**
   * Extrai texto de um arquivo a partir de sua URL
   * Útil para arquivos já armazenados no R2
   * @param url - URL do arquivo
   * @param mimeType - Tipo MIME do arquivo
   */
  async extractFromUrl(url: string, mimeType: string): Promise<TextExtractionResult> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const blob = await response.blob();
      return this.extract(blob, mimeType);
    } catch (error) {
      console.error('[TextExtractionService] URL extraction failed:', error);
      throw new Error('Falha ao extrair texto do arquivo');
    }
  },
};

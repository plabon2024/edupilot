import { PDFParse } from 'pdf-parse';

/**
 * Extracts text from a PDF Buffer directly in memory.
 * No local file path reading allows memory-only parsing and upload.
 */
export const extractTextFromPDF = async (dataBuffer: Buffer) => {
  try {
    if (!dataBuffer || dataBuffer.length === 0) {
      throw new Error('File buffer is empty');
    }

    // pdf-parse is a default function
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();
    
    return {
      text: data.text,
      numPages: data.pages,
      info: data.total,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw error;
  }
};

import { chunkText } from "../../utils/textChunker";
import { extractTextFromPDF } from "../../utils/pdfParser";
import { DocumentService } from "./document.service";

/**
 * Background processor for document text extraction and chunking.
 * Uses pdf-parse to extract text from the file buffer, then chunks it,
 * and updates the Document record to READY (or FAILED).
 */
export const processDocumentInBackground = async (
  documentId: string,
  userId: string,
  buffer: Buffer,
) => {
  try {
    console.log(
      `[DocumentProcessor] Started processing document: ${documentId}`,
    );

    // 1. Extract text using local PDF parser
    const { text: extractedText } = await extractTextFromPDF(buffer);

    // 2. Chunk the text
    const chunks = chunkText(extractedText, 500, 50);

    // 3. Update the database record
    await DocumentService.updateDocument(documentId, userId, {
      extractedText,
      chunks,
      status: "READY",
    });

    console.log(
      `[DocumentProcessor] Successfully processed document: ${documentId} (${chunks.length} chunks)`,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(
      `[DocumentProcessor] Failed to process document ${documentId}:`,
      message,
    );

    await DocumentService.updateDocument(documentId, userId, {
      status: "FAILED",
    }).catch((e) => console.error("Failed to update status to FAILED", e));
  }
};

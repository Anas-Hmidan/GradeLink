import pdf from "pdf-parse"
import mammoth from "mammoth"

export interface ProcessedDocument {
  text: string
  pageCount?: number
  wordCount: number
}

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    const data = await pdf(buffer)
    
    return {
      text: data.text,
      pageCount: data.numpages,
      wordCount: data.text.split(/\s+/).filter((word: string) => word.length > 0).length,
    }
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from Word document buffer (DOCX)
 */
export async function extractTextFromWord(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    
    const text = result.value
    const wordCount = text.split(/\s+/).filter((word: string) => word.length > 0).length
    
    return {
      text,
      wordCount,
    }
  } catch (error) {
    throw new Error(`Failed to process Word document: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Process document based on file type
 */
export async function processDocument(buffer: Buffer, mimeType: string): Promise<ProcessedDocument> {
  switch (mimeType) {
    case 'application/pdf':
      return await extractTextFromPDF(buffer)
    
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return await extractTextFromWord(buffer)
    
    default:
      throw new Error(`Unsupported file type: ${mimeType}`)
  }
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSize
}

/**
 * Validate file type
 */
export function validateFileType(mimeType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ]
  return allowedTypes.includes(mimeType)
}

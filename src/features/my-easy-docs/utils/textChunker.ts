// =============================================
// MyEasyDocs - Text Chunker
// Splits text into overlapping chunks for AI indexing
// =============================================

/**
 * Options for text chunking
 */
export interface ChunkOptions {
  /** Target size of each chunk in characters (default: 1000) */
  chunkSize?: number;
  /** Number of characters to overlap between chunks (default: 200) */
  overlap?: number;
  /** Minimum chunk size to include (default: 100) */
  minChunkSize?: number;
}

/**
 * A single text chunk with metadata
 */
export interface TextChunk {
  /** The chunk content */
  content: string;
  /** Index of this chunk (0-based) */
  index: number;
  /** Start position in original text */
  startPos: number;
  /** End position in original text */
  endPos: number;
}

/**
 * Default chunk settings
 */
const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 200;
const DEFAULT_MIN_CHUNK_SIZE = 100;

/**
 * Splits text into overlapping chunks suitable for AI indexing.
 * Tries to break at sentence boundaries when possible.
 *
 * @param text - The text to split into chunks
 * @param options - Chunking options
 * @returns Array of text chunks
 */
export function chunkText(text: string, options: ChunkOptions = {}): TextChunk[] {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    overlap = DEFAULT_OVERLAP,
    minChunkSize = DEFAULT_MIN_CHUNK_SIZE,
  } = options;

  // Validate inputs
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Normalize whitespace
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  // If text is smaller than chunk size, return as single chunk
  if (normalizedText.length <= chunkSize) {
    return [{
      content: normalizedText,
      index: 0,
      startPos: 0,
      endPos: normalizedText.length,
    }];
  }

  const chunks: TextChunk[] = [];
  let startPos = 0;
  let chunkIndex = 0;

  while (startPos < normalizedText.length) {
    // Calculate end position
    let endPos = Math.min(startPos + chunkSize, normalizedText.length);

    // If we're not at the end, try to find a good break point
    if (endPos < normalizedText.length) {
      endPos = findBreakPoint(normalizedText, startPos, endPos, chunkSize);
    }

    // Extract chunk
    const content = normalizedText.slice(startPos, endPos).trim();

    // Only add if meets minimum size
    if (content.length >= minChunkSize) {
      chunks.push({
        content,
        index: chunkIndex,
        startPos,
        endPos,
      });
      chunkIndex++;
    }

    // Move start position with overlap
    const step = endPos - startPos - overlap;
    if (step <= 0) {
      // Prevent infinite loop
      startPos = endPos;
    } else {
      startPos += step;
    }

    // Safety check for infinite loop
    if (startPos >= normalizedText.length) {
      break;
    }
  }

  return chunks;
}

/**
 * Finds a good break point in the text (sentence/paragraph boundary).
 * Searches backwards from the target end position.
 */
function findBreakPoint(
  text: string,
  startPos: number,
  targetEnd: number,
  maxChunkSize: number
): number {
  // Look for break points in order of preference
  const breakPatterns = [
    /\.\s+/, // Period followed by whitespace (sentence end)
    /\!\s+/, // Exclamation followed by whitespace
    /\?\s+/, // Question mark followed by whitespace
    /\n\n/,  // Paragraph break
    /\n/,    // Line break
    /;\s*/,  // Semicolon
    /,\s*/,  // Comma
    /\s+/,   // Any whitespace
  ];

  // Search area: from 70% of chunk size to target end
  const searchStart = startPos + Math.floor(maxChunkSize * 0.7);
  const searchText = text.slice(searchStart, targetEnd);

  for (const pattern of breakPatterns) {
    // Find all matches in search area
    const matches = [...searchText.matchAll(new RegExp(pattern, 'g'))];

    if (matches.length > 0) {
      // Use the last match (closest to target end)
      const lastMatch = matches[matches.length - 1];
      if (lastMatch.index !== undefined) {
        return searchStart + lastMatch.index + lastMatch[0].length;
      }
    }
  }

  // No good break point found, use target end
  return targetEnd;
}

/**
 * Splits text by paragraphs first, then chunks each paragraph.
 * Useful for documents with clear paragraph structure.
 *
 * @param text - The text to split
 * @param options - Chunking options
 * @returns Array of text chunks
 */
export function chunkByParagraphs(text: string, options: ChunkOptions = {}): TextChunk[] {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    overlap = DEFAULT_OVERLAP,
    minChunkSize = DEFAULT_MIN_CHUNK_SIZE,
  } = options;

  // Split by double newlines (paragraphs)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  const chunks: TextChunk[] = [];
  let chunkIndex = 0;
  let currentChunk = '';
  let chunkStartPos = 0;
  let textPos = 0;

  for (const paragraph of paragraphs) {
    const trimmedPara = paragraph.trim();

    // If adding this paragraph would exceed chunk size
    if (currentChunk.length + trimmedPara.length + 2 > chunkSize) {
      // Save current chunk if it meets minimum size
      if (currentChunk.length >= minChunkSize) {
        chunks.push({
          content: currentChunk.trim(),
          index: chunkIndex,
          startPos: chunkStartPos,
          endPos: textPos,
        });
        chunkIndex++;
      }

      // Start new chunk
      // If single paragraph is larger than chunk size, sub-chunk it
      if (trimmedPara.length > chunkSize) {
        const subChunks = chunkText(trimmedPara, { chunkSize, overlap, minChunkSize });
        for (const subChunk of subChunks) {
          chunks.push({
            ...subChunk,
            index: chunkIndex,
            startPos: textPos + subChunk.startPos,
            endPos: textPos + subChunk.endPos,
          });
          chunkIndex++;
        }
        currentChunk = '';
        chunkStartPos = textPos + trimmedPara.length;
      } else {
        currentChunk = trimmedPara;
        chunkStartPos = textPos;
      }
    } else {
      // Add to current chunk
      currentChunk = currentChunk
        ? currentChunk + '\n\n' + trimmedPara
        : trimmedPara;
    }

    textPos += paragraph.length + 2; // +2 for the \n\n separator
  }

  // Don't forget the last chunk
  if (currentChunk.length >= minChunkSize) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
      startPos: chunkStartPos,
      endPos: textPos,
    });
  }

  return chunks;
}

/**
 * Extracts just the content strings from chunks (for storage).
 *
 * @param chunks - Array of TextChunk objects
 * @returns Array of content strings
 */
export function getChunkContents(chunks: TextChunk[]): string[] {
  return chunks.map(chunk => chunk.content);
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Chunk {
  content: string;
  chunkIndex: number;
  pageNumber: number;
}

export interface RelevantChunk extends Chunk {
  score: number;
  rawScore: number;
  matchedWords: number;
}

// ─── chunkText ────────────────────────────────────────────────────────────────
export const chunkText = (
  text: string,
  chunkSize: number = 500,
  overlap: number = 50,
): Chunk[] => {
  chunkSize = Math.max(1, Math.floor(Number(chunkSize) || 500));
  overlap = Math.max(0, Math.floor(Number(overlap) || 0));
  if (overlap >= chunkSize) overlap = Math.max(0, chunkSize - 1);
  if (!text || typeof text !== 'string' || text.trim().length === 0) return [];

  const cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ').trim();
  const paragraphs = cleanedText.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const chunks: Chunk[] = [];
  let chunkIndex = 0;

  const pushChunkFromWords = (words: string[]) => {
    if (!words.length) return;
    chunks.push({ content: words.join(' '), chunkIndex: chunkIndex++, pageNumber: 0 });
  };
  const pushChunkFromParagraphs = (paras: string[]) => {
    if (!paras.length) return;
    chunks.push({ content: paras.join('\n\n'), chunkIndex: chunkIndex++, pageNumber: 0 });
  };

  let currentParagraphs: string[] = [];
  let currentWords: string[] = [];

  for (const paragraph of paragraphs) {
    const pWords = paragraph.split(/\s+/).filter(Boolean);
    const pLen = pWords.length;

    if (pLen > chunkSize) {
      if (currentParagraphs.length > 0) {
        pushChunkFromParagraphs(currentParagraphs);
        const flushed = currentParagraphs.join(' ').split(/\s+/).filter(Boolean);
        currentParagraphs = [];
        currentWords = overlap > 0 ? flushed.slice(Math.max(0, flushed.length - overlap)) : [];
      } else {
        currentWords = [];
      }
      const step = Math.max(1, chunkSize - overlap);
      for (let i = 0; i < pWords.length; i += step) {
        pushChunkFromWords(pWords.slice(i, i + chunkSize));
        if (i + chunkSize >= pWords.length) break;
      }
      continue;
    }

    const currentCount = currentParagraphs.length > 0
      ? currentParagraphs.join(' ').split(/\s+/).filter(Boolean).length
      : currentWords.length;

    if (currentCount + pLen > chunkSize) {
      const flushed = currentParagraphs.length > 0
        ? currentParagraphs.join(' ').split(/\s+/).filter(Boolean)
        : currentWords.slice();
      const overlapWords = overlap > 0 ? flushed.slice(Math.max(0, flushed.length - overlap)) : [];

      if (currentParagraphs.length > 0) pushChunkFromParagraphs(currentParagraphs);
      else if (currentWords.length > 0) pushChunkFromWords(currentWords);

      currentParagraphs = overlap === 0 ? [paragraph] : [];
      currentWords = overlap === 0 ? pWords.slice() : overlapWords.concat(pWords);
    } else {
      currentParagraphs.push(paragraph);
      currentWords = currentParagraphs.join(' ').split(/\s+/).filter(Boolean);
    }

    if (currentWords.length >= chunkSize) {
      if (currentWords.length === chunkSize) {
        if (currentParagraphs.length > 0) pushChunkFromParagraphs(currentParagraphs);
        else pushChunkFromWords(currentWords);
        const flushed = currentWords;
        currentParagraphs = [];
        currentWords = overlap > 0 ? flushed.slice(Math.max(0, flushed.length - overlap)) : [];
      } else {
        const first = currentWords.slice(0, chunkSize);
        const remainder = currentWords.slice(chunkSize);
        pushChunkFromWords(first);
        const overlapPart = overlap > 0 ? first.slice(Math.max(0, first.length - overlap)) : [];
        currentWords = overlapPart.concat(remainder);
        currentParagraphs = [];
      }
    }
  }

  if (currentParagraphs.length > 0) pushChunkFromParagraphs(currentParagraphs);
  else if (currentWords.length > 0) pushChunkFromWords(currentWords);

  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/).filter(Boolean);
    const step = Math.max(1, chunkSize - overlap);
    for (let i = 0; i < allWords.length; i += step) {
      pushChunkFromWords(allWords.slice(i, i + chunkSize));
      if (i + chunkSize >= allWords.length) break;
    }
  }
  return chunks;
};

// ─── findRelevantChunks ───────────────────────────────────────────────────────
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const findRelevantChunks = (
  chunks: Chunk[],
  query: string,
  maxChunks: number = 3,
): RelevantChunk[] => {
  if (!Array.isArray(chunks) || chunks.length === 0) return [];
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];

  const stopWords = new Set(['the','is','at','which','on','a','an','and','or','but','in','with','to','for','of','as','by','this','that','it']);
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}_]/gu, ''))
    .filter(Boolean)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) return [];

  const results: RelevantChunk[] = chunks.map((chunk, index) => {
    const content = (chunk.content || '').toLowerCase();
    const nWords = Math.max(1, content.split(/\s+/).filter(Boolean).length);
    let rawScore = 0;
    const matchedUnique = new Set<string>();

    for (const q of queryWords) {
      const exactRe = new RegExp(`\\b${escapeRegExp(q)}\\b`, 'gu');
      const exact = (content.match(exactRe) || []).length;
      rawScore += exact * 3;
      const partial = (content.match(new RegExp(escapeRegExp(q), 'gu')) || []).length;
      rawScore += Math.max(0, partial - exact);
      if (exact + partial > 0) matchedUnique.add(q);
    }
    if (matchedUnique.size > 1) rawScore += matchedUnique.size * 2;

    const positionBonus = (1 - index / Math.max(1, chunks.length)) * 0.05;
    const score = rawScore / Math.sqrt(nWords) + positionBonus;

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      score,
      rawScore,
      matchedWords: matchedUnique.size,
    };
  });

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.matchedWords - a.matchedWords || a.chunkIndex - b.chunkIndex)
    .slice(0, Math.max(0, Math.floor(maxChunks)));
};

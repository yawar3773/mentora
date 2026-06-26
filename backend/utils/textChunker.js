/**
 * Split text into chunks for better AI processing
 * @param {string} text - The text to be chunked
 * @param {number} chunkSize - Target size per chunk (in words)
 * @param {number} overlap - Number of words to overlap between chunks
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if (!text || text.trim().length === 0) {
        return [];
    }

    // Prevent invalid overlap values
    overlap = Math.min(overlap, chunkSize - 1);
    const step = Math.max(1, chunkSize - overlap);

    // Clean text while preserving paragraph structure
    const cleanedText = text
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ') // Collapse spaces/tabs only
        .replace(/\n{3,}/g, '\n\n') // Limit excessive blank lines
        .replace(/ *\n */g, '\n') // Trim spaces around newlines
        .trim();

    // Split into paragraphs
    const paragraphs = cleanedText
        .split(/\n{2,}|\n/)
        .filter((p) => p.trim().length > 0);

    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        // Large paragraph -> split into word chunks
        if (paragraphWordCount > chunkSize) {
            if (currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join('\n\n'),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0,
                });

                currentChunk = [];
                currentWordCount = 0;
            }

            for (let i = 0; i < paragraphWords.length; i += step) {
                const chunkWords = paragraphWords.slice(i, i + chunkSize);

                chunks.push({
                    content: chunkWords.join(' '),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0,
                });

                if (i + chunkSize >= paragraphWords.length) break;
            }

            continue;
        }

        // Start new chunk if current one is full
        if (
            currentWordCount + paragraphWordCount > chunkSize &&
            currentChunk.length > 0
        ) {
            chunks.push({
                content: currentChunk.join('\n\n'),
                chunkIndex: chunkIndex++,
                pageNumber: 0,
            });

            // Overlap from previous chunk
            const prevWords = currentChunk
                .join(' ')
                .split(/\s+/);

            const overlapText = prevWords
                .slice(-Math.min(overlap, prevWords.length))
                .join(' ');

            currentChunk = overlapText
                ? [overlapText, paragraph.trim()]
                : [paragraph.trim()];

            currentWordCount =
                (overlapText ? overlapText.split(/\s+/).length : 0) +
                paragraphWordCount;
        } else {
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }

    // Add final chunk
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n'),
            chunkIndex: chunkIndex++,
            pageNumber: 0,
        });
    }

    // Fallback
    if (chunks.length === 0 && cleanedText.length > 0) {
        const allWords = cleanedText.split(/\s+/);

        for (let i = 0; i < allWords.length; i += step) {
            const chunkWords = allWords.slice(i, i + chunkSize);

            chunks.push({
                content: chunkWords.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0,
            });

            if (i + chunkSize >= allWords.length) break;
        }
    }

    return chunks;
};

/**
 * Escape regex special characters
 * @param {string} text
 * @returns {string}
 */
const escapeRegex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of text chunks
 * @param {string} query - User query
 * @param {number} maxChunks - Maximum chunks to return
 * @returns {Array<Object>}
 */
export const findRelevantChunks = (
    chunks,
    query,
    maxChunks = 3
) => {
    if (!chunks || chunks.length === 0 || !query) {
        return [];
    }

    const stopWords = new Set([
        "the",
        "is",
        "at",
        "which",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "with",
        "to",
        "for",
        "of",
        "as",
        "by",
        "this",
        "that",
        "it",
    ]);

    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.replace(/[^\w]/g, ""))
        .filter((word) => word.length > 2 && !stopWords.has(word));

    // No useful keywords -> return first chunks
    if (queryWords.length === 0) {
        return chunks.slice(0, maxChunks).map((chunk) => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
        }));
    }

    const scoredChunks = chunks.map((chunk, index) => {
        const content = chunk.content.toLowerCase();
        let score = 0;

        for (const word of queryWords) {
            const escapedWord = escapeRegex(word);

            const exactMatches =
                (
                    content.match(
                        new RegExp(`\\b${escapedWord}\\b`, "g")
                    ) || []
                ).length;

            const partialMatches =
                (
                    content.match(
                        new RegExp(escapedWord, "g")
                    ) || []
                ).length;

            score += exactMatches * 3;
            score += Math.max(0, partialMatches - exactMatches) * 1.5;
        }

        // Count unique matched query words
        const uniqueWordsFound = queryWords.filter((word) =>
            content.includes(word)
        ).length;

        // Bonus for multiple query words
        if (uniqueWordsFound > 1) {
            score += uniqueWordsFound * 2;
        }

        // Normalize score
        const contentWords = content.split(/\s+/).length || 1;
        const normalizedScore = score / Math.sqrt(contentWords);

        // Slight preference for earlier chunks
        const positionBonus =
            1 - (index / Math.max(chunks.length, 1)) * 0.1;

        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore * positionBonus,
            matchedWords: uniqueWordsFound,
        };
    });

    return scoredChunks
        .filter((chunk) => chunk.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            if (b.matchedWords !== a.matchedWords) {
                return b.matchedWords - a.matchedWords;
            }

            return a.chunkIndex - b.chunkIndex;
        })
        .slice(0, maxChunks)
        .map(({ score, matchedWords, ...chunk }) => chunk);
};
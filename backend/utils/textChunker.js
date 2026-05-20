/**
 * Split text into chunks for better AI processing
 * @param {string} text - The text to be chunked
 * @param {number} ChunkSize - Target size per chunk (in words)
 * @param {number} overlap - Number of words to overlap between chunks
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>} - Array of text chunks
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if(!text || text.trim().length === 0) {
        return [];
    }

    // Clean text while preserving paragraph structure
    const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/ \n/g, '\n')
    .trim();

    // Try to split by paragraphs (single or double newlines)
    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);

    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for(const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        // If single paragraph exceeds chunk size, split it by words
        if(paragraphWordCount > chunkSize) {
            if(currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join('\n\n'),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0,
                });
                currentChunk = [];
                currentWordCount = 0;
            }

            // Split large paragraph into word-based chunks
            for(let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
                const chunkWords = paragraphWords.slice(i, i + chunkSize);
                chunks.push({
                    content: chunkWords.join(' '),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0,
                });

                if(i + chunkSize >= paragraphWords.length) break;
            }
            continue;
        }

        // If adding this paragraph exceeds chunk size, start a new chunk
        if(currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
            chunks.push({
                content: currentChunk.join('\n\n'),
                chunkIndex: chunkIndex++,
                pageNumber: 0,
            });

            // Create overlap from previous chunk
            const prevChunkText = currentChunk.join(' ');
            const prevWords = prevChunkText.split(/\s+/);
            const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');

            currentChunk = [overlapText, paragraph.trim()];
            currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
        } else {
            // Add paragraph to current chunk
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }

    // Add the last chunk
    if(currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n'),
            chunkIndex: chunkIndex++,
            pageNumber: 0,
        });
    }

    // Fallback: if no chunks created, split by words
    if(chunks.length === 0 && cleanedText.length > 0) {
        const allWords = cleanedText.split(/\s+/);
        for(let i = 0; i < allWords.length; i += (chunkSize - overlap)) {
            const chunkWords = allWords.slice(i, i + chunkSize);
            chunks.push({
                content: chunkWords.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0,
            });

            if(i + chunkSize >= allWords.length) break;
        }
    }

    return chunks;
};


/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Objects>} chunks - Array of text chunks
 * @param {string} query - User query to match against chunks
 * @param {number} maxChunks - Number of top relevant chunks to return
 * @returns {Array<Objects>} - Array of relevant chunks
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
    if(!chunks || chunks.length === 0 || !query) {
        return [];
    }

    // Common stop words to exclude
    const stopWords = new Set([
        'the', 'is', 'at', 'which', 'a', 'an', 'and', 'or',  'but',
        'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it'
    ]);

    // Extract and clean query words
    const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter( w => w.length > 2 && !stopWords.has(w) );

    if(queryWords.length === 0) {
        //Return clean chunk objects without mongoose metadeta
        return chunks.slice(0,maxChunks).map( chunk => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id
        }));
    }

    const scoredChunks = chunks.map( (chunk, index) => {
        const content = chunk.content.toLowerCase();
        let score = 0;

        // Score each query word
        for(const word of queryWords) {
            //Exact word match (Higher score)
            const exactMatches = (content.match(new RegExp(`\\b${word}\\b`,'g')) || []).length;
            score += exactMatches * 3;

            //Partial match (Lower score)
            const partialMatches = (content.match(new RegExp(word, 'g')) || []).length;
            score += Math.max(0, partialMatches - exactMatches) * 1.5; // Avoid double counting exact matches
        }

        // Bonus: Multply query words found
        const uniqueWordsFound =  queryWords.filter(word => {
            content.includes(word)
        }).length;

        if(uniqueWordsFound > 1) {
            score += uniqueWordsFound * 2; // Bonus for multiple query words in the same chunk
        }

        // Normalize by content length
        const contentWords = content.split(/\s+/).length || 1;
        const normalizedScore = score / Math.sqrt(contentWords);

        // Small bonus for earlier chunks (assuming they might be more relevant)
        const positionBonus = 1 - (index / chunks.length) * 0.1; // Up to 10% bonus for earlier chunks

        // Return clean object without Mongoose metadata
        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore * positionBonus,
            rawScore: score,
            matchedWords: uniqueWordsFound
        };
    });
    
    return scoredChunks
    .filter(chunk => chunk.score > 0) // Only consider chunks with a positive score
    .sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score; // Sort by score descending
        }
        if(b.matchedWords !== a.matchedWords) {
            return b.matchedWords - a.matchedWords; // Then by number of matched words
        }
        return a.chunkIndex - b.chunkIndex; // Finally, maintain original order for ties
    })
    .slice(0, maxChunks) // Return top relevant chunks
};
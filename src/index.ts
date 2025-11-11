import { fetchCitationMetadata, formatCitation } from "./citation";

export { fetchCitationMetadata, formatCitation }

// ============================================================================
// EXAMPLE USAGE (if run directly)
// ============================================================================

// Only runs if this file is executed directly (not when imported)
if (require.main === module) {
    (async () => {
        console.log('=== Citation System Demo ===\n');

        // Example 1: DOI
        console.log('1. From DOI:');
        console.log('─'.repeat(50));
        try {
            const result1 = await fetchCitationMetadata({
                doi: '10.1145/3290605.3300536'
            });
            console.log('Success:', result1.success);
            console.log('Citation:', formatCitation(result1.metadata));
        } catch (error) {
            console.error('Error:', error);
        }
        console.log('\n');

        // Example 2: Manual book
        console.log('2. Manual book:');
        console.log('─'.repeat(50));
        try {
            const result2 = await fetchCitationMetadata({
                isbn: '9780316679077',
            });
            console.log('Citation:', formatCitation(result2.metadata));
        } catch (error) {
            console.error('Error:', error);
        }
        console.log('\n');

        // Example 3: Wikipedia
        console.log('3. Wikipedia article:');
        console.log('─'.repeat(50));
        try {
            const result3 = await fetchCitationMetadata({
                url: 'https://en.wikipedia.org/wiki/Jason_Cohen_(entrepreneur)'
            });
            console.log('Citation:', formatCitation(result3.metadata));
        } catch (error) {
            console.error('Error:', error);
        }
        console.log('\n');

        // Example 4: YouTube video
        console.log('4. YouTube video:');
        console.log('─'.repeat(50));
        try {
            const result4 = await fetchCitationMetadata({
                url: 'https://www.youtube.com/watch?v=teq6CehQqOg',
            });
            console.log('Citation:', formatCitation(result4.metadata));
        } catch (error) {
            console.error('Error:', error);
        }
    })();
}
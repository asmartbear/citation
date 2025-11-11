import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-doi';
import '@citation-js/plugin-isbn';
import { scrapeUrl } from './urls'
import { CitationMetadataInput, CitationMetadata, MetadataFetchResult, CSLDate, FormatOptions, CSLPerson } from './types'

/**
 * Fetch and enrich citation metadata from various sources
 * This function does all the heavy lifting: DOI lookups, web scraping, etc.
 * The result can be cached and reused.
 */
export async function fetchCitationMetadata(input: CitationMetadataInput): Promise<MetadataFetchResult> {
    const warnings: string[] = [];
    let metadata: CitationMetadata = {
        type: 'article',
        _fetchedAt: new Date().toISOString(),
        _originalInput: { ...input }
    };
    let source: 'doi' | 'isbn' | 'url' | 'manual' | 'mixed' = 'manual';
    let success = false;

    try {
        // Priority 1: Try DOI
        if (input.doi) {
            try {
                console.log(`Fetching DOI: ${input.doi}`);
                const cite = await Cite.async(input.doi);
                const data = cite.data[0];

                metadata = {
                    ...metadata,
                    ...data,
                    _fetchedFrom: 'doi'
                };
                source = 'doi';
                success = true;
                console.log('✓ DOI metadata fetched successfully');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                warnings.push(`DOI fetch failed: ${errorMessage}`);
                console.warn(`✗ DOI fetch failed: ${errorMessage}`);
            }
        }

        // Priority 2: Try ISBN
        if (!success && input.isbn) {
            try {
                console.log(`Fetching ISBN: ${input.isbn}`);
                const cite = await Cite.async(input.isbn);
                const data = cite.data[0];

                metadata = {
                    ...metadata,
                    ...data,
                    _fetchedFrom: 'isbn'
                };
                source = 'isbn';
                success = true;
                console.log('✓ ISBN metadata fetched successfully');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                warnings.push(`ISBN fetch failed: ${errorMessage}`);
                console.warn(`✗ ISBN fetch failed: ${errorMessage}`);
            }
        }

        // Priority 3: Try URL scraping
        if (!success && input.url) {
            try {
                console.log(`Scraping URL: ${input.url}`);
                const scraped = await scrapeUrl(input.url)
                const targetUrl = scraped.url ?? input.url; // Handle redirects
                const now = new Date()
                console.log('Scraped data:', scraped);

                // Convert to CSL format
                const cslData: CitationMetadata = {
                    type: 'webpage',
                    title: scraped.title || 'Untitled',
                    URL: targetUrl,
                    accessed: {
                        'date-parts': [[
                            now.getFullYear(),
                            now.getMonth() + 1,
                            now.getDate()
                        ]]
                    }
                };

                // Parse author
                if (scraped.author) {
                    cslData.author = parseAuthors(scraped.author);
                }

                // Parse date
                const date = parseDate(scraped.date)
                const published = parseDate(scraped.datePublished)
                const modified = parseDate(scraped.dateModified)
                cslData.issued = published ?? modified ?? date

                // Add publisher/site name
                if (scraped.publisher) {
                    cslData['container-title'] = scraped.publisher;
                }

                // Add description as abstract
                if (scraped.description) {
                    cslData.abstract = scraped.description;
                }

                metadata = {
                    ...metadata,
                    ...cslData,
                    _fetchedFrom: 'url'
                };
                source = 'url';
                success = true;
                console.log('✓ URL metadata scraped successfully');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                warnings.push(`URL scraping failed: ${errorMessage}`);
                console.warn(`✗ URL scraping failed: ${errorMessage}`);
            }
        }

        // Step 4: Apply manual overrides and fill in missing fields
        const manualData = buildManualMetadata(input);

        if (Object.keys(manualData).length > 0) {
            // Merge manual data, giving it priority
            metadata = {
                ...metadata,
                ...manualData
            };

            if (source !== 'manual') {
                source = 'mixed';
            }

            // If we have any data at all, consider it a success
            if (metadata.title || metadata.author || metadata.URL) {
                success = true;
            }
        }

        // Ensure we have at least a type
        if (!metadata.type) {
            if (input.url) {
                metadata.type = 'webpage';
            } else if (input.isbn) {
                metadata.type = 'book';
            } else {
                metadata.type = 'article';
            }
        }

        // Generate an ID if not present (useful for caching)
        if (!metadata.id) {
            metadata.id = generateMetadataId(metadata);
        }

        return {
            success,
            metadata,
            source,
            warnings: warnings.length > 0 ? warnings : undefined
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Fatal error fetching metadata:', error);

        // Return what we have, even if incomplete
        return {
            success: false,
            metadata: {
                ...metadata,
                ...buildManualMetadata(input)
            },
            source: 'manual',
            warnings,
            error: errorMessage
        };
    }
}

/**
 * Format citation metadata into a styled citation string
 * Takes the cached metadata and generates the final output
 */
export function formatCitation(
    metadata: CitationMetadata,
    options: FormatOptions = {}
): string {
    const {
        style = 'chicago-note-bibliography',
        format = 'html',
        lang = 'en-US',
        wrapper = false
    } = options;

    try {
        // Create a clean copy without our internal fields
        const cleanMetadata: any = { ...metadata };
        delete cleanMetadata._fetchedFrom;
        delete cleanMetadata._fetchedAt;
        delete cleanMetadata._originalInput;

        // Create citation object
        const cite = new Cite(cleanMetadata);

        // Generate formatted citation
        const formatted = cite.format('bibliography', {
            format,
            template: style,
            lang
        });

        // Clean up HTML if needed
        if (format === 'html' && !wrapper) {
            return cleanHtmlCitation(formatted);
        }

        return formatted;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error formatting citation:', error);
        throw new Error(`Failed to format citation: ${errorMessage}`);
    }
}


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build metadata from manual input fields
 */
function buildManualMetadata(input: CitationMetadataInput): Partial<CitationMetadata> {
    const metadata: Partial<CitationMetadata> = {};

    // Direct field mappings
    const directFields = [
        'type', 'title', 'title-short', 'abstract', 'publisher',
        'publisher-place', 'volume', 'issue', 'page', 'number-of-pages',
        'edition', 'DOI', 'ISBN', 'ISSN', 'URL', 'language', 'keyword',
        'collection-title', 'collection-number', 'event', 'event-place',
        'genre', 'medium', 'note', 'container-title', 'container-title-short',
        'dimensions'
    ];

    directFields.forEach(field => {
        if (input[field] !== undefined && input[field] !== null) {
            (metadata as any)[field] = input[field];
        }
    });

    // Author handling
    if (input.author) {
        if (Array.isArray(input.author)) {
            metadata.author = input.author.map(a =>
                typeof a === 'string' ? parseAuthor(a) : a
            ).filter((a): a is CSLPerson => a !== null);
        } else if (typeof input.author === 'string') {
            metadata.author = parseAuthors(input.author);
        } else {
            metadata.author = [input.author as CSLPerson];
        }
    }

    // Editor handling
    if (input.editor) {
        if (Array.isArray(input.editor)) {
            metadata.editor = input.editor.map(e =>
                typeof e === 'string' ? parseAuthor(e) : e
            ).filter((e): e is CSLPerson => e !== null);
        } else if (typeof input.editor === 'string') {
            metadata.editor = parseAuthors(input.editor);
        }
    }

    // Translator handling
    if (input.translator) {
        if (Array.isArray(input.translator)) {
            metadata.translator = input.translator.map(t =>
                typeof t === 'string' ? parseAuthor(t) : t
            ).filter((t): t is CSLPerson => t !== null);
        } else if (typeof input.translator === 'string') {
            metadata.translator = parseAuthors(input.translator);
        }
    }

    // Date handling - issued
    if (input.date || input.year || input.issued) {
        if (input.issued) {
            metadata.issued = input.issued;
        } else if (input.date) {
            metadata.issued = parseDate(input.date);
        } else if (input.year) {
            metadata.issued = {
                'date-parts': [[parseInt(String(input.year))]]
            };
        }
    }

    // Date handling - accessed
    if (input.accessed) {
        metadata.accessed = input.accessed;
    } else if (input.accessDate) {
        metadata.accessed = parseDate(input.accessDate);
    }

    // Include any raw CSL fields
    if (input.raw && typeof input.raw === 'object') {
        Object.assign(metadata, input.raw);
    }

    return metadata;
}

/**
 * Parse multiple authors from a string
 */
function parseAuthors(authorString: string): CSLPerson[] {
    if (!authorString) return [];

    // Split on common delimiters
    const separators = /\s+and\s+|,(?!\s*(?:Jr|Sr|III|II|IV))|;|&/i;
    const authors = authorString
        .split(separators)
        .map(a => a.trim())
        .filter(a => a.length > 0);

    return authors.map(parseAuthor).filter((a): a is CSLPerson => a !== null);
}

/**
 * Parse a single author string into CSL person format
 */
function parseAuthor(authorString: string): CSLPerson | null {
    if (!authorString || authorString.trim() === '') return null;

    const trimmed = authorString.trim();

    // Check if it looks like "Last, First" format
    if (trimmed.includes(',')) {
        const parts = trimmed.split(',').map(p => p.trim());
        if (parts.length === 2) {
            return {
                family: parts[0],
                given: parts[1]
            };
        }
    }

    // Otherwise assume "First Last" format
    const words = trimmed.split(/\s+/);

    if (words.length === 1) {
        // Single name - could be organization or mononym
        return { literal: words[0] };
    } else if (words.length === 2) {
        return {
            given: words[0],
            family: words[1]
        };
    } else {
        // Multiple words - assume last is family name, rest is given
        // Check for suffixes
        const suffixes = ['Jr', 'Jr.', 'Sr', 'Sr.', 'II', 'III', 'IV', 'V'];
        const lastWord = words[words.length - 1];

        if (suffixes.includes(lastWord)) {
            return {
                given: words.slice(0, -2).join(' '),
                family: words[words.length - 2],
                suffix: lastWord
            };
        }

        return {
            given: words.slice(0, -1).join(' '),
            family: words[words.length - 1]
        };
    }
}

/**
 * Parse date string into CSL date format
 */
function parseDate(dateString: string | null | undefined): CSLDate | undefined {
    if (!dateString) return undefined
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        // If parse fails, return as raw string
        return { raw: dateString };
    }

    return {
        'date-parts': [[
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        ]]
    };
}

/**
 * Generate a unique ID for metadata (for caching purposes)
 */
function generateMetadataId(metadata: CitationMetadata): string {
    // Use DOI if available
    if (metadata.DOI) {
        return `doi:${metadata.DOI}`;
    }

    // Use ISBN if available
    if (metadata.ISBN) {
        return `isbn:${metadata.ISBN}`;
    }

    // Use URL if available
    if (metadata.URL) {
        return `url:${metadata.URL}`;
    }

    // Generate from title and author
    const title = (metadata.title || '').toLowerCase().replace(/\s+/g, '-').substring(0, 30);
    const author = metadata.author && metadata.author[0]
        ? metadata.author[0].family || metadata.author[0].literal || ''
        : '';
    const year = metadata.issued && metadata.issued['date-parts']
        ? metadata.issued['date-parts'][0][0]
        : '';

    return `${author}-${year}-${title}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

/**
 * Clean up HTML output from citation-js
 */
function cleanHtmlCitation(htmlString: string): string {
    let cleaned = htmlString;

    // Remove outer div wrapper
    cleaned = cleaned.replace(/<div[^>]*class="csl-bib-body"[^>]*>/g, '');
    cleaned = cleaned.replace(/<div[^>]*class="csl-entry"[^>]*>/g, '');
    cleaned = cleaned.replace(/<\/div>/g, '');

    // Trim whitespace
    cleaned = cleaned.trim();

    return cleaned;
}
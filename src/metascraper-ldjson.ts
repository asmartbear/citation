// Simplified TypeScript version with minimal type dependencies
// This version avoids Cheerio type conflicts

import type { RuleBundle } from 'metascraper';

// We use require to avoid type issues with @metascraper/helpers
const { $jsonld, toRule } = require('@metascraper/helpers');

/**
 * Interface for Person/Organization schema in JSON-LD
 */
interface JsonLdAuthor {
    '@type'?: string | string[];
    name?: string;
    givenName?: string;
    familyName?: string;
    alternateName?: string;
    '@id'?: string;
}

/**
 * Interface for JSON-LD objects that might contain author information
 */
interface JsonLdContent {
    '@context'?: string | object;
    '@type'?: string | string[];
    author?: string | JsonLdAuthor | Array<string | JsonLdAuthor>;
    creator?: string | JsonLdAuthor | Array<string | JsonLdAuthor>;
    contributor?: string | JsonLdAuthor | Array<string | JsonLdAuthor>;
    [key: string]: any;
}

/**
 * Extracts author name from various JSON-LD format structures
 * @param authorData - The author data from JSON-LD (can be string, object, or array)
 * @returns The extracted author name(s) or null
 */
export function extractAuthorName(authorData: any): string | null {
    if (!authorData) return null;

    // Handle string author
    if (typeof authorData === 'string') {
        return authorData.trim();
    }

    // Handle array of authors
    if (Array.isArray(authorData)) {
        const authors = authorData
            .map(author => extractAuthorName(author))
            .filter(Boolean) as string[];
        return authors.length > 0 ? authors.join(', ') : null;
    }

    // Handle object author (Person or Organization schema)
    if (typeof authorData === 'object') {
        // Try different name properties in order of preference
        if (authorData.name) {
            return authorData.name.trim();
        }

        // Handle separated first/last name
        if (authorData.givenName && authorData.familyName) {
            return `${authorData.givenName} ${authorData.familyName}`.trim();
        }

        // Fallback options
        if (authorData.alternateName) {
            return authorData.alternateName.trim();
        }

        // If it's just an @id reference without a name, skip it
        return null;
    }

    return null;
}

/**
 * Content types that typically have authors in JSON-LD
 */
const AUTHOR_CONTENT_TYPES = [
    'Article',
    'NewsArticle',
    'BlogPosting',
    'ScholarlyArticle',
    'TechArticle',
    'Report',
    'Book',
    'Review',
    'CreativeWork',
    'WebPage',
    'VideoObject',
    'Course',
    'Dataset',
    'SoftwareSourceCode',
    'WebSite',
    'MediaObject'
];

/**
 * Checks if a JSON-LD type indicates content that might have an author
 */
function isAuthorContentType(types: string[]): boolean {
    return types.some((type: string) =>
        AUTHOR_CONTENT_TYPES.some(contentType =>
            type === contentType ||
            type.includes(`:${contentType}`) || // Handle schema.org prefixes
            type.endsWith(`/${contentType}`) // Handle full URLs
        )
    );
}

/**
 * Metascraper rule for extracting authors from JSON-LD structured data.
 * This rule checks for authors in application/ld+json script tags.
 * 
 * @returns A RuleBundle with author extraction logic
 * 
 * @example
 * ```typescript
 * import metascraper from 'metascraper';
 * import metascraperAuthor from 'metascraper-author';
 * import { metascraperAuthorJsonLd } from './metascraper-author-jsonld';
 * 
 * const scraper = metascraper([
 *   metascraperAuthorJsonLd(),  // Check JSON-LD first
 *   metascraperAuthor(),         // Fallback to meta tags
 * ]);
 * 
 * const metadata = await scraper({ html, url });
 * console.log(metadata.author); // "Jane Doe, John Smith"
 * ```
 */
export function metascraperAuthorJsonLd(): RuleBundle {
    return {
        author: [
            toRule(({ htmlDom }: { htmlDom: any }) => {
                try {
                    // Extract JSON-LD data from the HTML
                    const jsonld = $jsonld(htmlDom);

                    if (!jsonld) return null;

                    // Handle both single object and array of JSON-LD objects
                    const jsonldArray: JsonLdContent[] = Array.isArray(jsonld) ? jsonld : [jsonld];

                    // Iterate through all JSON-LD objects looking for author information
                    for (const obj of jsonldArray) {
                        // Skip if no @type is specified
                        if (!obj['@type']) continue;

                        // Normalize @type to array for consistent handling
                        const types = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']];

                        // Check if this is a content type that typically has authors
                        if (!isAuthorContentType(types)) continue;

                        // Try to find author in various properties (in order of preference)
                        const authorData = obj.author || obj.creator || obj.contributor;

                        if (authorData) {
                            const extractedAuthor = extractAuthorName(authorData);
                            if (extractedAuthor) {
                                return extractedAuthor;
                            }
                        }
                    }

                    // No author found in JSON-LD
                    return null;
                } catch (error) {
                    // Silently fail and let other rules handle it
                    // This is important for the metascraper chain to continue
                    return null;
                }
            })
        ]
    };
}

// Default export for convenience
export default metascraperAuthorJsonLd;
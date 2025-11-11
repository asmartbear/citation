/**
 * Person/Author in CSL format
 */
export interface CSLPerson {
    /** Given name (first name) */
    given?: string;
    /** Family name (last name) */
    family?: string;
    /** Literal name (for organizations or single-name entities) */
    literal?: string;
    /** Dropping particle (e.g., "van", "de") */
    'dropping-particle'?: string;
    /** Non-dropping particle (e.g., "von", "di") */
    'non-dropping-particle'?: string;
    /** Suffix (e.g., "Jr.", "III") */
    suffix?: string;
}

/**
 * Date in CSL format
 */
export interface CSLDate {
    /** Date parts as nested arrays [year, month, day] */
    'date-parts'?: Array<[number] | [number, number] | [number, number, number]>;
    /** Raw date string */
    raw?: string;
    /** Season (1-4 for Spring-Winter) */
    season?: number;
    /** Circa flag */
    circa?: boolean;
}

/**
 * Complete citation metadata in CSL-JSON format
 * This is the structure you'll cache
 */
export interface CitationMetadata {
    /** CSL type: 'book', 'article-journal', 'webpage', etc. */
    type: string;

    /** Unique identifier for caching */
    id?: string;

    /** Title of the work */
    title?: string;

    /** Subtitle or secondary title */
    'title-short'?: string;

    /** Authors */
    author?: CSLPerson[];

    /** Editors */
    editor?: CSLPerson[];

    /** Translators */
    translator?: CSLPerson[];

    /** Container title (journal, book title, website name) */
    'container-title'?: string;

    /** Short container title */
    'container-title-short'?: string;

    /** Publisher name */
    publisher?: string;

    /** Publisher location/place */
    'publisher-place'?: string;

    /** Publication date */
    issued?: CSLDate;

    /** Date accessed (for web sources) */
    accessed?: CSLDate;

    /** Volume number */
    volume?: number | string;

    /** Issue number */
    issue?: number | string;

    /** Page range (e.g., "123-145") */
    page?: string;

    /** Number of pages */
    'number-of-pages'?: number | string;

    /** Edition */
    edition?: number | string;

    /** DOI */
    DOI?: string;

    /** ISBN */
    ISBN?: string;

    /** ISSN */
    ISSN?: string;

    /** URL */
    URL?: string;

    /** Abstract or summary */
    abstract?: string;

    /** Keywords */
    keyword?: string;

    /** Language */
    language?: string;

    /** Collection title (series name) */
    'collection-title'?: string;

    /** Collection number (series number) */
    'collection-number'?: number | string;

    /** Event (conference name) */
    event?: string;

    /** Event place */
    'event-place'?: string;

    /** Genre (e.g., "Research report", "White paper") */
    genre?: string;

    /** Medium (e.g., "DVD", "CD") */
    medium?: string;

    /** Note or additional information */
    note?: string;

    /** Dimensions (e.g., video length) */
    dimensions?: string;

    /** Interviewer (for interviews) */
    interviewer?: CSLPerson[];

    /** Source of the metadata (for debugging/tracking) */
    _fetchedFrom?: 'doi' | 'isbn' | 'url' | 'manual';

    /** Timestamp when metadata was fetched */
    _fetchedAt?: string;

    /** Original input used to fetch this metadata */
    _originalInput?: CitationMetadataInput;

    /** Any other CSL fields */
    [key: string]: any;
}

/**
 * Input parameters for fetching citation metadata
 */
export interface CitationMetadataInput {
    /** DOI identifier */
    doi?: string;

    /** ISBN identifier */
    isbn?: string;

    /** URL to scrape */
    url?: string;

    /** Longform slug to convert to a URL */
    longform?: string,

    /** CSL type */
    type?: string;

    /** Title */
    title?: string;

    /** Author(s) */
    author?: string | string[] | CSLPerson[];

    /** Editor(s) */
    editor?: string | string[] | CSLPerson[];

    /** Translator(s) */
    translator?: string | string[] | CSLPerson[];

    /** Publisher */
    publisher?: string;

    /** Publication year */
    year?: number | string;

    /** Publication date */
    date?: string;

    /** Date accessed */
    accessed?: CSLDate;

    /** Date accessed (alternative format) */
    accessDate?: string;

    /** Issued date */
    issued?: CSLDate;

    /** Container title (journal, book title, website name) */
    'container-title'?: string;

    /** Volume number */
    volume?: number | string;

    /** Issue number */
    issue?: number | string;

    /** Page range (e.g., "123-145") */
    page?: string;

    /** Any additional CSL fields */
    raw?: Record<string, any>;

    /** Any other fields */
    [key: string]: any;
}

/**
 * Options for formatting citations
 */
export interface FormatOptions {
    /** Citation style (default: 'chicago-note-bibliography') */
    style?: string;

    /** Output format (default: 'html') */
    format?: 'html' | 'text' | 'rtf';

    /** Language (default: 'en-US') */
    lang?: string;

    /** Whether to wrap in container div (default: false) */
    wrapper?: boolean;
}

/**
 * Result from metadata fetching with status info
 */
export interface MetadataFetchResult {
    /** Whether fetch was successful */
    success: boolean;

    /** The metadata (may be partial if fetch failed) */
    metadata: CitationMetadata;

    /** Source that provided the metadata */
    source: 'doi' | 'isbn' | 'url' | 'manual' | 'mixed';

    /** Any warnings or issues encountered */
    warnings?: string[];

    /** Error message if fetch failed */
    error?: string;
}
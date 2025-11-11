// Type declarations for @metascraper/helpers
declare module '@metascraper/helpers' {
    // Using 'any' for Cheerio types to avoid version conflicts
    // The actual Cheerio API is passed as htmlDom

    export interface RuleContext {
        htmlDom: any; // CheerioAPI instance
        url: string;
        html?: string;
    }

    export type RuleFunction = (context: RuleContext) => string | null | undefined;
    export type Rule = RuleFunction;

    /**
     * Wraps a rule function to ensure proper return value handling
     */
    export function toRule(fn: RuleFunction): Rule;

    /**
     * Extracts and parses JSON-LD data from the HTML
     */
    export function $jsonld(htmlDom: any): any;

    /**
     * Helper for extracting author information
     */
    export function author(options?: {
        attribute?: string;
        selectors?: string[];
    }): Rule;

    /**
     * Helper for extracting title information
     */
    export function title(options?: {
        attribute?: string;
        selectors?: string[];
    }): Rule;

    /**
     * Helper for extracting description information
     */
    export function description(options?: {
        attribute?: string;
        selectors?: string[];
    }): Rule;

    /**
     * Helper for extracting date information
     */
    export function date(options?: {
        attribute?: string;
        selectors?: string[];
    }): Rule;

    /**
     * Helper for extracting image information
     */
    export function image(options?: {
        attribute?: string;
        selectors?: string[];
    }): Rule;

    /**
     * Helper for extracting URL information
     */
    export function url(options?: {
        attribute?: string;
        selectors?: string[];
    }): Rule;

    /**
     * Helper for extracting publisher information
     */
    export function publisher(options?: {
        attribute?: string;
        selectors?: string[];
    }): Rule;

    /**
     * Helper for extracting language information
     */
    export function lang(options?: {
        attribute?: string;
        selectors?: string[];
    }): Rule;

    /**
     * Normalizes a URL
     */
    export function normalizeUrl(url: string): string;

    /**
     * Checks if a string is a valid URL
     */
    export function isUrl(url: string): boolean;

    /**
     * Gets attribute value from element
     */
    export function $filter(
        $: any,
        collection: any,
        fn: (el: any) => string | null
    ): string | null;

    /**
     * Wraps text extraction
     */
    export function text(el: any): string | null;

    /**
     * Helper for parsing HTML
     */
    export function parseHTML(html: string): any;
}
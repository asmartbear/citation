
// ============================================================================
// TYPE DECLARATIONS FOR EXTERNAL PACKAGES
// ============================================================================

declare module '@citation-js/core' {
    export class Cite {
        constructor(data: any);
        static async(input: string | any): Promise<Cite>;
        data: any[];
        format(
            format: 'bibliography' | 'citation',
            options?: {
                format?: 'html' | 'text' | 'rtf';
                template?: string;
                lang?: string;
            }
        ): string;
    }
}

declare module '@citation-js/plugin-csl' { }
declare module '@citation-js/plugin-doi' { }
declare module '@citation-js/plugin-isbn' { }

declare module 'metascraper' {
    interface MetascraperOptions {
        html: string;
        url: string;
    }

    interface MetascraperResult {
        author?: string;
        date?: string;
        datePublished?: string;
        dateModified?: string;
        description?: string;
        image?: string;
        logo?: string;
        publisher?: string;
        title?: string;
        url?: string;
    }

    type MetascraperPlugin = () => any;
    type Metascraper = (plugins: any[]) => (options: MetascraperOptions) => Promise<MetascraperResult>;

    const metascraper: Metascraper;
    // export = metascraper;
}

declare module 'metascraper-author' {
    const plugin: () => any;
    // export = plugin;
}
declare module 'metascraper-date' {
    const plugin: () => any;
    // export = plugin;
}
declare module 'metascraper-description' {
    const plugin: () => any;
    // export = plugin;
}
declare module 'metascraper-image' {
    const plugin: () => any;
    // export = plugin;
}
declare module 'metascraper-logo' {
    const plugin: () => any;
    // export = plugin;
}
declare module 'metascraper-publisher' {
    const plugin: () => any;
    // export = plugin;
}
declare module 'metascraper-title' {
    const plugin: () => any;
    // export = plugin;
}
declare module 'metascraper-url' {
    const plugin: () => any;
    // export = plugin;
}
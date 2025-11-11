// Type declarations for metascraper
declare module 'metascraper' {
  export interface RuleContext {
    htmlDom: any; // CheerioAPI
    url: string;
    html?: string;
  }

  export type Rule = (context: RuleContext) => string | null | undefined | Promise<string | null | undefined>;

  export interface RuleBundle {
    [key: string]: Rule | Rule[];
  }

  export interface MetadataResult {
    author?: string | null;
    date?: string | null;
    description?: string | null;
    image?: string | null;
    logo?: string | null;
    publisher?: string | null;
    title?: string | null;
    url?: string | null;
    lang?: string | null;
    [key: string]: any;
  }

  export interface MetascraperOptions {
    html: string;
    url: string;
  }

  export type RuleModule = () => RuleBundle;

  function metascraper(rules: RuleModule[]): (options: MetascraperOptions) => Promise<MetadataResult>;

  export default metascraper;
}

declare module 'metascraper-author' {
  import { RuleBundle } from 'metascraper';
  const metascraperAuthor: () => RuleBundle;
  export default metascraperAuthor;
}

declare module 'metascraper-date' {
  import { RuleBundle } from 'metascraper';
  interface DateOptions {
    datePublished?: boolean;
    dateModified?: boolean;
  }
  const metascraperDate: (options?: DateOptions) => RuleBundle;
  export default metascraperDate;
}

declare module 'metascraper-description' {
  import { RuleBundle } from 'metascraper';
  const metascraperDescription: () => RuleBundle;
  export default metascraperDescription;
}

declare module 'metascraper-image' {
  import { RuleBundle } from 'metascraper';
  const metascraperImage: () => RuleBundle;
  export default metascraperImage;
}

declare module 'metascraper-logo' {
  import { RuleBundle } from 'metascraper';
  const metascraperLogo: () => RuleBundle;
  export default metascraperLogo;
}

declare module 'metascraper-publisher' {
  import { RuleBundle } from 'metascraper';
  const metascraperPublisher: () => RuleBundle;
  export default metascraperPublisher;
}

declare module 'metascraper-title' {
  import { RuleBundle } from 'metascraper';
  const metascraperTitle: () => RuleBundle;
  export default metascraperTitle;
}

declare module 'metascraper-url' {
  import { RuleBundle } from 'metascraper';
  const metascraperUrl: () => RuleBundle;
  export default metascraperUrl;
}
// metascraper-ldjson.ts
function extractAuthorName(authorData: any): string | null {
    if (!authorData) return null;
    if (typeof authorData === 'string') return authorData.trim();

    if (Array.isArray(authorData)) {
        const authors = authorData.map(extractAuthorName).filter(Boolean) as string[];
        return authors.length ? authors.join(', ') : null;
    }

    if (typeof authorData === 'object') {
        if (authorData.name) return String(authorData.name).trim();
        if (authorData.givenName && authorData.familyName)
            return `${authorData.givenName} ${authorData.familyName}`.trim();
        if (authorData.alternateName) return String(authorData.alternateName).trim();
    }
    return null;
}

const stripHtmlComments = (s: string) => s.replace(/^\s*<!--|-->\s*$/g, '').trim();
const safeParse = (s: string) => { try { return JSON.parse(stripHtmlComments(s)); } catch { return null; } };
const asArray = <T>(v: T | T[] | null | undefined) => (Array.isArray(v) ? v : v != null ? [v] : []);
const getTypes = (node: any): string[] => asArray(node?.['@type']).map(String);

const extractJsonLdNodes = (htmlDom: any): any[] => {
    const nodes: any[] = [];
    htmlDom('script[type="application/ld+json"]').each((_: number, el: any) => {
        const raw = htmlDom(el).contents().text();
        const data = safeParse(raw);
        if (!data) return;

        const pushNode = (n: any) => {
            if (!n || typeof n !== 'object') return;
            if (Array.isArray(n['@graph'])) nodes.push(...n['@graph']);
            else nodes.push(n);
        };

        if (Array.isArray(data)) data.forEach(pushNode);
        else pushNode(data);
    });
    return nodes;
};

function metascraperAuthorJsonLd() {
    return {
        author: [
            ({ htmlDom }: any): string | null => {

                const nodes = extractJsonLdNodes(htmlDom);
                if (!nodes.length) return null;

                const contentTypes = new Set([
                    'Article', 'NewsArticle', 'BlogPosting', 'ScholarlyArticle', 'TechArticle',
                    'Report', 'Book', 'Review', 'CreativeWork', 'WebPage', 'VideoObject', 'Course'
                ]);

                // Pass 1: CreativeWork/WebPage-like nodes
                for (const node of nodes) {
                    const types = getTypes(node);
                    const isContent = types.some(t => [...contentTypes].some(ct => t.includes(ct)));
                    if (!isContent) continue;

                    const authorData =
                        node.author ??
                        node.creator ??
                        node.contributor ??
                        node.reviewedBy ??
                        node.editor ??
                        node.publisher?.author;

                    const a1 = extractAuthorName(authorData);
                    if (a1) return a1;

                    const a2 = extractAuthorName(node.mainEntity?.author ?? node.mainEntity?.creator);
                    if (a2) return a2;
                }

                // Pass 2: standalone Person/Organization
                for (const node of nodes) {
                    const types = getTypes(node);
                    if (types.includes('Person') || types.includes('Organization')) {
                        const a = extractAuthorName(node);
                        if (a) return a;
                    }
                }

                return null;
            }
        ]
    };
}

export default metascraperAuthorJsonLd;
export { metascraperAuthorJsonLd, extractAuthorName };

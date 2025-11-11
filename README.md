# Citation

Creates formatting citations against URLs, DOI, ISBN, or manual fields.

## Usage

```typescript
import { fetchCitationMetadata, formatCitation } from "@asmartbear/citation"
// Fetch meta-data information, loading from the internet from
// DOI references, ISBN numbers, or meta-data from websites over URLs.
const meta = await fetchCitationMetadata({'isbn':'123456'})
// Formatting a citation with options.
console.log(formatCitation(meta,{format:'html'}))
```

## Development

Build:

```bash
npm run build
```

Unit tests:

```bash
npm run test
```

Unit tests, refreshed live:

```bash
npm run watch
```

Prepare for release (e.g. run tests and bump version number):

```bash
npm run release
```

Publish to npm:

```bash
npm publish
```

# CTRXL DRACIN API

Custom API backend powered by Cloudflare Workers with multiple source aggregation and automatic fallback.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Create KV Namespace

```bash
npx wrangler kv:namespace create API_CACHE
```

Update `wrangler.toml` with the KV namespace ID.

### 4. Set Admin Password

```bash
npx wrangler secret put ADMIN_PASSWORD
```

### 5. Deploy

```bash
npx wrangler deploy
```

## Development

### Local Development

```bash
npm run dev
```

This starts a local development server at `http://localhost:8787`.

### View Logs

```bash
npm run tail
```

## Configuration

Edit `src/index.ts` to:
- Add/remove API sources
- Change priorities
- Modify cache TTL
- Adjust endpoints

## Deployment

```bash
npm run deploy
```

## Environment Variables

Set via Cloudflare Dashboard or `wrangler secret`:

- `ADMIN_PASSWORD`: Password for admin panel access

## API Endpoints

### Public

- `GET /api/trending`
- `GET /api/latest`
- `GET /api/foryou`
- `GET /api/search?query=<query>`
- `GET /api/detail?bookId=<bookId>`
- `GET /api/allepisode?bookId=<bookId>`

### Admin (Requires Auth)

- `GET /admin/sources`
- `GET /admin/stats`
- `GET /admin/cache/clear`

## License

MIT

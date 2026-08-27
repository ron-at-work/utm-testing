# Northline College — UTM lead test (React)

## Run

```bash
cd college-utm
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Exact ad → landing → form flow

1. Start at `/` → `http://localhost:5173/#/` (fake Google Ads)
2. Click the **Sponsored** ad
3. Land on `/#/college?utm_source=google&utm_medium=cpc&...`
4. Click **Apply** / **Start an inquiry**
5. Submit → CRM lead with `marketing_attribution`

(Hash routes so refresh never 404s.)

`licenseKey` / `appSecret` are prefilled in the form Dev settings (api-dev).

Old static HTML copies live in `../legacy/`.

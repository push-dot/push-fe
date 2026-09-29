import { chromium } from "playwright";

const URL_ = "http://localhost:3000/community";
const N = 5;

const browser = await chromium.launch();
const rows = [];
for (let i = 0; i < N; i++) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { authorization: "Bearer test-token" } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__CHATTEA_AUTH__ = { authorization: "Bearer test-token" }; });
  let gqlRequests = 0;
  page.on("request", (r) => {
    if (r.url().includes("/api/graphql")) gqlRequests += 1;
  });
  const t0 = Date.now();
  await page.goto(URL_, { waitUntil: "load" });
  await page.waitForSelector("text=POSTMARKER-1", { timeout: 10000 }).catch(() => {});
  const firstContentMs = Date.now() - t0;
  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] ?? {};
    const paints = performance.getEntriesByType("paint");
    const fcp = paints.find((p) => p.name === "first-contentful-paint");
    const lcp = performance.getEntriesByType("largest-contentful-paint").at(-1);
    return {
      ttfb: nav.responseStart ?? null,
      fcp: fcp?.startTime ?? null,
      lcp: lcp?.startTime ?? null,
      dcl: nav.domContentLoadedEventEnd ?? null,
    };
  });
  rows.push({ run: i + 1, firstContentMs, gqlRequests, ...timing });
  await ctx.close();
}
await browser.close();
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
console.table(rows);
console.log("median firstContent:", med(rows.map((r) => r.firstContentMs)),
  "| median fcp:", med(rows.map((r) => r.fcp)),
  "| median lcp:", med(rows.map((r) => r.lcp)),
  "| gql requests:", rows.map((r) => r.gqlRequests).join(","));

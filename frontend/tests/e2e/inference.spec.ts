// Playwright E2E scaffold
// Requires Playwright config and installation to run.
import { test, expect } from '@playwright/test';

test('inference flow (smoke)', async ({ page }) => {
  // Smoke: ensure dev server responds and returns HTML
  const resp = await page.request.get('http://localhost:5173/');
  expect(resp.status()).toBe(200);
  const body = await resp.text();
  expect(body).toContain('<div id="root">');
});

import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title', async ({ page }) => {
  // Expect h1 to contain a substring.
    expect(await page.locator('h1').innerText()).toContain('Welcome');
  });

  test('has hero component', async ({ page }) => {
    const hero = page.locator('lib-hero');
    await expect(hero).toBeVisible();
    
    // await expect(hero.locator('.title')).toHaveText('Welcome my-project');
    // await expect(hero.locator('.subtitle')).toHaveText('Build something amazing today');
    // await expect(hero.locator('.cta')).toHaveText('Get Started');
  });

  test('screenshots', async ({ page }) => {
    await expect(page).toHaveScreenshot();
  });


})




const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Ghost Loading / Skeleton Screen on Initial Load', () => {
  const rootUrl = `file://${path.resolve(__dirname, 'index.html')}`;

  test('verifies skeleton cards are displayed initially and then hidden after timeout', async ({ page }) => {
    // Navigate to the gourmet food shop index page
    await page.goto(rootUrl);

    // Verify skeleton cards are present and visible on initial render (loading class on grid)
    const productGrid = page.locator('#product-grid');
    await expect(productGrid).toHaveClass(/loading/);

    const skeletonCards = page.locator('.skeleton-card');
    await expect(skeletonCards).toHaveCount(6);
    await expect(skeletonCards.first()).toBeVisible();

    // Verify real food cards are hidden initially when product-grid is in loading state
    const foodCards = page.locator('.food-card');
    await expect(foodCards.first()).toBeHidden();

    // Take screenshot during ghost loading
    await page.screenshot({ path: 'index-ghost-loading.png' });

    // Wait for the skeleton loading timeout to finish (1000ms + some buffer)
    await page.waitForTimeout(1500);

    // Verify loading class is removed and grid is no longer in loading state
    await expect(productGrid).not.toHaveClass(/loading/);

    // Verify skeleton cards are now hidden
    await expect(skeletonCards.first()).toBeHidden();

    // Verify actual food cards are visible
    await expect(foodCards.first()).toBeVisible();

    // Take screenshot after transition to actual food items
    await page.screenshot({ path: 'index-loaded-food.png' });
  });
});

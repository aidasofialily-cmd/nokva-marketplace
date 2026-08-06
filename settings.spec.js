const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Account Settings Page', () => {
  const settingsUrl = `file://${path.resolve(__dirname, 'pages/settings.html')}`;

  test('renders logged-out landing page correctly without marketing options', async ({ page }) => {
    await page.goto(settingsUrl);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const loggedOutView = page.locator('#settings-logged-out-view');
    await expect(loggedOutView).toBeVisible();

    const loggedInView = page.locator('#settings-logged-in-view');
    await expect(loggedInView).toBeHidden();

    const marketingZone = page.locator('#marketing-zone');
    await expect(marketingZone).toBeHidden();
  });

  test('renders logged-in view with marketing zone', async ({ page }) => {
    await page.goto(settingsUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
    });
    await page.reload();

    const loggedInView = page.locator('#settings-logged-in-view');
    await expect(loggedInView).toBeVisible();

    const marketingZone = page.locator('#marketing-zone');
    await expect(marketingZone).toBeVisible();

    // Inactive state should be visible initially
    const inactiveView = page.locator('#marketing-inactive-view');
    await expect(inactiveView).toBeVisible();

    const activeView = page.locator('#marketing-active-view');
    await expect(activeView).toBeHidden();
  });

  test('can activate and deactivate marketing account', async ({ page }) => {
    await page.goto(settingsUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
    });
    await page.reload();

    // Setup dialog handler to automatically accept alerts/confirms
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const inactiveView = page.locator('#marketing-inactive-view');
    const activeView = page.locator('#marketing-active-view');

    // Click activate button
    const activateBtn = page.locator('#btn-activate-marketing');
    await activateBtn.click();

    // Verify active view is now visible
    await expect(activeView).toBeVisible();
    await expect(inactiveView).toBeHidden();

    // Verify metrics are visible and correct
    const campaignsMetric = page.locator('#metric-campaigns');
    await expect(campaignsMetric).toHaveText('3');

    const impressionsMetric = page.locator('#metric-impressions');
    await expect(impressionsMetric).toHaveText('12,450');

    // Verify localStorage key is set
    const isMarketingActive = await page.evaluate(() => localStorage.getItem('user_marketing_account'));
    expect(isMarketingActive).toBe('true');

    // Click deactivate button
    const deactivateBtn = page.locator('#btn-deactivate-marketing');
    await deactivateBtn.click();

    // Verify inactive view is back
    await expect(inactiveView).toBeVisible();
    await expect(activeView).toBeHidden();

    // Verify localStorage key is removed
    const isMarketingActiveAfter = await page.evaluate(() => localStorage.getItem('user_marketing_account'));
    expect(isMarketingActiveAfter).toBeNull();
  });

  test('clears marketing state on account deletion', async ({ page }) => {
    await page.goto(settingsUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user_marketing_account', 'true');
    });
    await page.reload();

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const deleteBtn = page.locator('#btn-delete-account');
    await deleteBtn.click();

    const isMarketingActive = await page.evaluate(() => localStorage.getItem('user_marketing_account'));
    expect(isMarketingActive).toBeNull();

    const isLoggedIn = await page.evaluate(() => localStorage.getItem('isLoggedIn'));
    expect(isLoggedIn).toBeNull();
  });
});

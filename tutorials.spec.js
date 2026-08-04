const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('App Tutorials Page Integration', () => {
  const rootUrl = `file://${path.resolve(__dirname, 'index.html')}`;
  const tutorialsUrl = `file://${path.resolve(__dirname, 'pages/tutorials.html')}`;

  test('verifies tutorials links are present in index.html header and footer', async ({ page }) => {
    await page.goto(rootUrl);

    // Verify header "App Tutorials" link exists and has the correct attribute
    const headerLink = page.locator('header .btn-tutorials');
    await expect(headerLink).toBeVisible();
    await expect(headerLink).toHaveAttribute('href', 'pages/tutorials.html');

    // Verify footer link exists and has the correct attribute
    const footerLink = page.locator('footer a:text("App Tutorials")');
    await expect(footerLink).toBeVisible();
    await expect(footerLink).toHaveAttribute('href', 'pages/tutorials.html');

    // Screenshot index page with tutorials links
    await page.screenshot({ path: 'index-tutorials-links.png' });
  });

  test('renders logged-out app tutorials page correctly', async ({ page }) => {
    await page.goto(tutorialsUrl);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Verify page title and subtitle
    const heroTitle = page.locator('.hero-title');
    await expect(heroTitle).toHaveText('App Tutorials & Guides');

    const heroSubtitle = page.locator('.hero-subtitle');
    await expect(heroSubtitle).toContainText('Learn how to browse fresh food');

    // Verify all 3 major tutorial cards exist
    const cards = page.locator('.tutorial-card');
    await expect(cards).toHaveCount(3);

    // Check headings
    await expect(cards.nth(0).locator('h2')).toContainText('Gourmet Shop & Placing Orders');
    await expect(cards.nth(1).locator('h2')).toContainText('Bookmarks & Account Settings');
    await expect(cards.nth(2).locator('h2')).toContainText('Developer Hub Integration');

    // Header actions should contain login and signup links since logged out
    const logInBtn = page.locator('.header-actions a.btn-login');
    await expect(logInBtn).toBeVisible();
    await expect(logInBtn).toHaveAttribute('href', 'login.html');

    const signUpBtn = page.locator('.header-actions a.btn-signup');
    await expect(signUpBtn).toBeVisible();
    await expect(signUpBtn).toHaveAttribute('href', 'signup.html');

    // Take screenshot of logged-out tutorials view
    await page.screenshot({ path: 'tutorials-logged-out.png' });
  });

  test('renders logged-in app tutorials page correctly', async ({ page }) => {
    await page.goto(tutorialsUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user_fullname', 'Jane Foodie');
    });
    await page.reload();

    // Log out button should be visible in header
    const logOutBtn = page.locator('.header-actions #btn-logout');
    await expect(logOutBtn).toBeVisible();

    // Bookmarks and settings buttons should also be visible in header
    const bookmarksBtn = page.locator('.header-actions .btn-bookmarks');
    await expect(bookmarksBtn).toBeVisible();

    const settingsBtn = page.locator('.header-actions .btn-settings');
    await expect(settingsBtn).toBeVisible();

    // Take screenshot of logged-in tutorials view
    await page.screenshot({ path: 'tutorials-logged-in.png' });
  });

  test('banned user accessing tutorials.html is redirected to banned.html', async ({ page }) => {
    await page.goto(tutorialsUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isBanned', 'true');
    });
    await page.reload();

    // Should redirect to banned.html
    await page.waitForURL(/banned\.html/);
    expect(page.url()).toContain('pages/banned.html');
  });

  test('verifies "Developing Apps Tutorials" link is present in developers.html footer', async ({ page }) => {
    const developersUrl = `file://${path.resolve(__dirname, 'pages/developers.html')}`;
    await page.goto(developersUrl);

    // Verify footer link exists and has the correct attribute
    const footerLink = page.locator('footer a:text("Developing Apps Tutorials")');
    await expect(footerLink).toBeVisible();
    await expect(footerLink).toHaveAttribute('href', 'tutorials.html');
  });
});

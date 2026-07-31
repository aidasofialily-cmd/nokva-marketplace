const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('My Bookmarks Page', () => {
  const bookmarksUrl = `file://${path.resolve(__dirname, 'pages/bookmarks.html')}`;

  test('renders logged-out landing page correctly', async ({ page }) => {
    // Navigate with localStorage clear to simulate logged-out user
    await page.goto(bookmarksUrl);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Verify logged-out landing view is visible
    const loggedOutView = page.locator('#bookmarks-logged-out-view');
    await expect(loggedOutView).toBeVisible();

    const loggedInView = page.locator('#bookmarks-logged-in-view');
    await expect(loggedInView).toBeHidden();

    // Verify correct contents on landing page
    const title = page.locator('#bookmarks-logged-out-view .form-title');
    await expect(title).toHaveText('My Bookmarks');

    const logInBtn = page.locator('#bookmarks-logged-out-view a:text("Log In")');
    await expect(logInBtn).toBeVisible();
    await expect(logInBtn).toHaveAttribute('href', 'login.html');

    const signUpBtn = page.locator('#bookmarks-logged-out-view a:text("Sign Up")');
    await expect(signUpBtn).toBeVisible();
    await expect(signUpBtn).toHaveAttribute('href', 'signup.html');

    // Take screenshot of logged-out view
    await page.screenshot({ path: 'bookmarks-logged-out.png' });
  });

  test('renders logged-in view with bookmarks', async ({ page }) => {
    await page.goto(bookmarksUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('bookmarks', JSON.stringify(['Artisan Cheeseburger', 'Neapolitan Pizza']));
    });
    await page.reload();

    // Verify logged-in view is visible
    const loggedInView = page.locator('#bookmarks-logged-in-view');
    await expect(loggedInView).toBeVisible();

    const loggedOutView = page.locator('#bookmarks-logged-out-view');
    await expect(loggedOutView).toBeHidden();

    // Verify bookmarked items are rendered
    const products = page.locator('.food-card');
    await expect(products).toHaveCount(2);

    const firstProductTitle = products.nth(0).locator('.food-name');
    await expect(firstProductTitle).toHaveText('Artisan Cheeseburger');

    const secondProductTitle = products.nth(1).locator('.food-name');
    await expect(secondProductTitle).toHaveText('Neapolitan Pizza');

    // Take screenshot of logged-in view
    await page.screenshot({ path: 'bookmarks-logged-in.png' });
  });

  test('renders logged-in empty state when there are no bookmarks', async ({ page }) => {
    await page.goto(bookmarksUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('bookmarks', JSON.stringify([]));
    });
    await page.reload();

    // Verify logged-in empty state
    const emptyState = page.locator('#empty-state');
    await expect(emptyState).toBeVisible();

    const products = page.locator('.food-card');
    await expect(products).toHaveCount(0);
  });
});
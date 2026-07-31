const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Customer Support Page', () => {
  const supportUrl = `file://${path.resolve(__dirname, 'pages/support.html')}`;

  test('renders logged-out customer support page correctly', async ({ page }) => {
    // Navigate with localStorage clear to simulate logged-out user
    await page.goto(supportUrl);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Verify support headers/titles
    const title = page.locator('.hero-title');
    await expect(title).toHaveText('Customer Support Hub');

    const subtitle = page.locator('.hero-subtitle');
    await expect(subtitle).toContainText('We are here to help you');

    // Form should exist and have fields empty
    const fullnameInput = page.locator('#fullname');
    const emailInput = page.locator('#email');
    await expect(fullnameInput).toHaveValue('');
    await expect(emailInput).toHaveValue('');

    // Header actions should contain login and signup links
    const logInBtn = page.locator('.header-actions a.btn-login');
    await expect(logInBtn).toBeVisible();
    await expect(logInBtn).toHaveAttribute('href', 'login.html');

    const signUpBtn = page.locator('.header-actions a.btn-signup');
    await expect(signUpBtn).toBeVisible();
    await expect(signUpBtn).toHaveAttribute('href', 'signup.html');

    // Take screenshot of logged-out view
    await page.screenshot({ path: 'support-logged-out.png' });
  });

  test('renders logged-in support page with user info pre-filled', async ({ page }) => {
    await page.goto(supportUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user_fullname', 'Jane Foodie');
      localStorage.setItem('user_email', 'jane@nokvamarketplace.com');
    });
    await page.reload();

    // Verify fields are pre-filled
    const fullnameInput = page.locator('#fullname');
    const emailInput = page.locator('#email');
    await expect(fullnameInput).toHaveValue('Jane Foodie');
    await expect(emailInput).toHaveValue('jane@nokvamarketplace.com');

    // Log out button should be visible in header
    const logOutBtn = page.locator('.header-actions #btn-logout');
    await expect(logOutBtn).toBeVisible();

    // Take screenshot of logged-in view
    await page.screenshot({ path: 'support-logged-in.png' });
  });

  test('submitting the support form triggers success', async ({ page }) => {
    await page.goto(supportUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user_fullname', 'Jane Foodie');
      localStorage.setItem('user_email', 'jane@nokvamarketplace.com');
    });
    await page.reload();

    // Fill the rest of the form
    await page.fill('#subject', 'Test Subject Inquiry');
    await page.fill('#message', 'Hello, this is a test support ticket message!');

    // Handle dialog alert when submitting
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Support ticket submitted successfully');
      await dialog.accept();
    });

    // Click submit
    await page.click('button:text("Submit Ticket")');

    // Verify fields are reset (fullname/email get populated again on DOMContentLoaded reload or reset, but check that subject is cleared)
    const subjectInput = page.locator('#subject');
    await expect(subjectInput).toHaveValue('');
  });
});
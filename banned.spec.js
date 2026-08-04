const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Banned Account and Blocked User Redirection', () => {
  const indexUrl = `file://${path.resolve(__dirname, 'index.html')}`;
  const loginUrl = `file://${path.resolve(__dirname, 'pages/login.html')}`;
  const bookmarksUrl = `file://${path.resolve(__dirname, 'pages/bookmarks.html')}`;
  const settingsUrl = `file://${path.resolve(__dirname, 'pages/settings.html')}`;

  test('logging in as banned@example.com sets isBanned and redirects to banned.html', async ({ page }) => {
    await page.goto(loginUrl);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Fill the login form
    await page.fill('#email', 'banned@example.com');
    await page.fill('#password', 'somepassword');

    // Accept alert dialog
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Logged in successfully!');
      await dialog.accept();
    });

    // Submit
    await page.click('.btn-submit');

    // Verify redirected to banned.html
    await page.waitForURL(/banned\.html/);
    expect(page.url()).toContain('pages/banned.html');

    // Check localStorage has banned state
    const isBanned = await page.evaluate(() => localStorage.getItem('isBanned'));
    expect(isBanned).toBe('true');

    const isLoggedIn = await page.evaluate(() => localStorage.getItem('isLoggedIn'));
    expect(isLoggedIn).toBe('true');
  });

  test('banned user accessing index.html is redirected to pages/banned.html', async ({ page }) => {
    await page.goto(indexUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isBanned', 'true');
    });
    await page.reload();

    // Should redirect to pages/banned.html
    await page.waitForURL(/pages\/banned\.html/);
    expect(page.url()).toContain('pages/banned.html');
  });

  test('banned user accessing bookmarks.html is redirected to banned.html', async ({ page }) => {
    await page.goto(bookmarksUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isBanned', 'true');
    });
    await page.reload();

    // Should redirect to banned.html
    await page.waitForURL(/banned\.html/);
    expect(page.url()).toContain('pages/banned.html');
  });

  test('banned user accessing settings.html is redirected to banned.html', async ({ page }) => {
    await page.goto(settingsUrl);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isBanned', 'true');
    });
    await page.reload();

    // Should redirect to banned.html
    await page.waitForURL(/banned\.html/);
    expect(page.url()).toContain('pages/banned.html');
  });

  test('clicking logout on pages/banned.html clears session and redirects to index.html', async ({ page }) => {
    await page.goto(`file://${path.resolve(__dirname, 'pages/banned.html')}`);
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isBanned', 'true');
    });
    await page.reload();

    // Click on Logout
    await page.click('#btn-banned-logout');

    // Should redirect to index.html
    await page.waitForURL(/index\.html/);
    expect(page.url()).toContain('index.html');

    // Check localStorage has been cleared
    const isLoggedIn = await page.evaluate(() => localStorage.getItem('isLoggedIn'));
    expect(isLoggedIn).toBeNull();

    const isBanned = await page.evaluate(() => localStorage.getItem('isBanned'));
    expect(isBanned).toBeNull();
  });

  test('submitting offensive content on support.html bans the user and redirects to banned.html with custom reason', async ({ page }) => {
    const supportUrl = `file://${path.resolve(__dirname, 'pages/support.html')}`;
    await page.goto(supportUrl);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Fill form with offensive content
    await page.fill('#fullname', 'Abusive User');
    await page.fill('#email', 'abuser@example.com');
    await page.fill('#subject', 'Some message');
    await page.fill('#message', 'This message is offensive!');

    // Handle the dialog alert triggered during submission
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('offensive');
      await dialog.accept();
    });

    // Click submit
    await page.click('button:text("Submit Ticket")');

    // Should redirect to pages/banned.html
    await page.waitForURL(/banned\.html/);
    expect(page.url()).toContain('pages/banned.html');

    // Check localStorage has the isBanned state and the specific banned_reason
    const isBanned = await page.evaluate(() => localStorage.getItem('isBanned'));
    expect(isBanned).toBe('true');

    const bannedReason = await page.evaluate(() => localStorage.getItem('banned_reason'));
    expect(bannedReason).toContain('Offensive');

    // Check that pages/banned.html displays the dynamic banned reason
    const displayedReason = await page.textContent('#banned-reason-text');
    expect(displayedReason).toContain('Offensive');
  });
});
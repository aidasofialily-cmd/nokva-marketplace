const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Terms of Service and Privacy Policy Integration', () => {
  const rootUrl = `file://${path.resolve(__dirname, 'index.html')}`;
  const privacyUrl = `file://${path.resolve(__dirname, 'pages/privacy.html')}`;
  const termsUrl = `file://${path.resolve(__dirname, 'pages/terms.html')}`;

  test('verifies privacy footer header and links are present in index.html', async ({ page }) => {
    await page.goto(rootUrl);

    // Verify footer heading "Privacy" exists
    const privacyHeader = page.locator('footer .footer-col h3:text("Privacy")');
    await expect(privacyHeader).toBeVisible();

    // Verify legal links in index.html footer
    const privacyLink = page.locator('footer .footer-col a:text("Privacy Policy")');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute('href', 'pages/privacy.html');

    const termsLink = page.locator('footer .footer-col a:text("Terms of Service")');
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toHaveAttribute('href', 'pages/terms.html');

    // Screenshot index page footer
    await page.screenshot({ path: 'index-footer.png' });
  });

  test('verifies Privacy Policy page content and navigation', async ({ page }) => {
    await page.goto(privacyUrl);

    // Verify main header
    const mainTitle = page.locator('.legal-title');
    await expect(mainTitle).toHaveText('Privacy Policy');

    // Check specific policy sections
    const sec1 = page.locator('.legal-section h2:text("1. Information We Collect")');
    await expect(sec1).toBeVisible();

    const sec2 = page.locator('.legal-section h2:text("2. How We Use Your Information")');
    await expect(sec2).toBeVisible();

    // Verify privacy page footer contains the legal links
    const privacyLink = page.locator('footer .footer-col a:text("Privacy Policy")');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute('href', 'privacy.html');

    // Screenshot privacy policy page
    await page.screenshot({ path: 'privacy-policy.png' });
  });

  test('verifies Terms of Service page content and navigation', async ({ page }) => {
    await page.goto(termsUrl);

    // Verify main header
    const mainTitle = page.locator('.legal-title');
    await expect(mainTitle).toHaveText('Terms of Service');

    // Check specific terms sections
    const sec1 = page.locator('.legal-section h2:text("1. Acceptance of Terms")');
    await expect(sec1).toBeVisible();

    const sec2 = page.locator('.legal-section h2:text("2. Use of the Site")');
    await expect(sec2).toBeVisible();

    // Verify terms page footer contains the legal links
    const termsLink = page.locator('footer .footer-col a:text("Terms of Service")');
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toHaveAttribute('href', 'terms.html');

    // Screenshot terms of service page
    await page.screenshot({ path: 'terms-of-service.png' });
  });
});

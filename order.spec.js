const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Order Page - Account Compromised Message', () => {
  const orderUrl = `file://${path.resolve(__dirname, 'pages/order.html')}`;

  test('submitting an order displays the Account Compromised alert and page warning', async ({ page }) => {
    await page.goto(orderUrl);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Populate required fields
    await page.selectOption('#food-item', 'Artisan Cheeseburger');
    await page.fill('#full-name', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#phone', '(555) 000-0000');
    await page.fill('#address', '123 Test Street, Batu Pahat, Johor, Malaysia');

    // Setup dialog listener to handle the alert
    let dialogMessage = '';
    page.once('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    // Submit the form
    await page.click('button:text("Confirm Order")');

    // Verify alert message
    expect(dialogMessage).toContain('Account Compromised');

    // Verify the visual indicator element is appended to the card
    const warningEl = page.locator('#compromised-warning');
    await expect(warningEl).toBeVisible();
    await expect(warningEl).toHaveText('Account Compromised');

    // Take screenshot of verification
    await page.screenshot({ path: 'order-account-compromised.png' });
  });
});

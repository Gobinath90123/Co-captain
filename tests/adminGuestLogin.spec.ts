import { test, expect, chromium } from '@playwright/test';

test.describe.only('Guest-Admin Approval Flow', () => {
  let browser;
  let guestContext, guestPage;
  let adminContext, adminPage;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: false });

    // Create separate contexts
      // Create separate contexts
    guestContext = await browser.newContext();
    adminContext = await browser.newContext();

    // Create separate pages
    // Create separate pages

    guestPage = await guestContext.newPage();
    adminPage = await adminContext.newPage();
  });

  test('Guest sends approval request', async () => {
    await guestPage.goto('http://dev.guestuser.cocaptain.co.in/#/qr-login/1amud9t235/G1');
    await guestPage.locator('#ion-input-0').click();
    await guestPage.locator('#ion-input-0').fill('6384071537');
    await guestPage.locator('#firstName div').nth(1).click();
  await guestPage.locator('#ion-input-1').fill('manikam');
  await guestPage.getByRole('button', { name: 'STEP-IN -Taste Awaits' }).click();


    await guestPage.click('button#requestApproval');
    await expect(guestPage.locator('text=Approval Sent')).toBeVisible();
  });

  test('Admin approves request', async () => {
    await adminPage.goto('http://dev.kot.cocaptain.co.in/#/login/1amud9t235');
      await adminPage.locator('div').filter({ hasText: /^User ID$/ }).click();
      await adminPage.getByRole('textbox', { name: 'User ID' }).click();
      await adminPage.getByRole('textbox', { name: 'User ID' }).fill('murali');
      await adminPage.getByRole('textbox', { name: 'Password' }).click();
      await adminPage.getByRole('textbox', { name: 'Password' }).fill('Murali@1');
      await adminPage.getByRole('button', { name: 'Login' }).click();

    await adminPage.click('a#pendingApprovals');
    await expect(adminPage.locator('text=New Approval Request from guest_user')).toBeVisible();

    await adminPage.click('button#approve');
    await expect(adminPage.locator('text=Approval Successful')).toBeVisible();


  });

  test.afterAll(async () => {
    await browser.close();
  });
});

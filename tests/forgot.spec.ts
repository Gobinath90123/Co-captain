import { test, expect } from '@playwright/test';

test.describe('Forgot Screen Functionality', { tag: ['@E2E'] }, () => {

  test('TC_01 : Verify "Forgot Password" functionality', async ({ page }) => {
    await page.goto('http://dev.restro.cocaptain.co.in/restaurant/register', { waitUntil: 'load' });

  });

  test('test', async ({ page }) => {
    //login
    await page.goto('http://dev.guestuser.cocaptain.co.in/#/qr-login/1amud9t235/G2');
    await page.getByRole('textbox', { name: 'Login ID' }).fill('gugai@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('gugai@1');
    await page.getByRole('button', { name: 'Login' }).click();


    //credentials
    await login();



    await page.getByRole('button', { name: 'menu' }).click();
    await page.getByText('Table-Subscription').click();
    await expect(page.getByLabel('Select Type')).toBeVisible();
    await page.getByLabel('Select Type').selectOption('1');
    await page.locator('#cardInput').click();
    await page.locator('#cardInput').fill('2');
    await page.locator('[id="\\31 "]').click();
    await page.locator('[id="\\31 "]').fill('MV3');
    await page.locator('[id="\\31 "]').press('Tab');
    await page.locator('[id="\\32 "]').fill('MV2');
    await page.getByRole('button', { name: 'Calculate' }).click();
    await page.getByRole('checkbox', { name: 'By continuing to pay, I' }).check();
    await page.getByRole('button', { name: 'Proceed to Pay' }).click();
    await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'Mobile number' }).click();
    await page.locator('iframe').contentFrame().getByRole('textbox', { name: 'Mobile number' }).fill('7708537130');
    await page.locator('iframe').contentFrame().getByTestId('nav-sidebar').locator('div').filter({ hasText: 'UPI' }).nth(2).click();
    await page.locator('iframe').contentFrame().getByPlaceholder('example@okhdfcbank').click();
    await page.locator('iframe').contentFrame().getByPlaceholder('example@okhdfcbank').fill('axis@');
    await page.locator('iframe').contentFrame().getByRole('button', { name: '@okaxis' }).click();
    await page.locator('iframe').contentFrame().getByTestId('vpa-submit').click();


    await page.goto('http://dev.restro.cocaptain.co.in/#/restaurant/restaurant-dashboard');
    await page.getByRole('button', { name: 'menu' }).click();
    await page.getByText('Table QR-Code').click();


});
//Guest login
test('test', async ({ page }) => {
  await page.goto('http://dev.guestuser.cocaptain.co.in/#/qr-login/1amud9t235/G2');
  await page.locator('#ion-input-0').click();
  await page.locator('#ion-input-0').fill('7708537130');
  await page.locator('#firstName div').nth(1).click();
  await page.locator('#ion-input-1').fill('manikam');
  await page.getByRole('button', { name: 'STEP-IN -Taste Awaits' }).click();

});




    
    await page.goto('http://dev.kot.cocaptain.co.in/#/login/1amud9t235');





    async function login() {
      await page.getByRole('textbox', { name: 'Login ID' }).fill('gugai@gmail.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('gugai@1');
      await page.getByRole('button', { name: 'Login' }).click();
    }
  });



});
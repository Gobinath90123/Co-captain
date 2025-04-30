import { Page, expect, test } from '@playwright/test';

function log(message: string) {
  console.log(`[AdminHelper] ${new Date().toISOString()} - ${message}`);
}

export class AdminHelper {
  static async adminLogin(page: Page, ADMIN_URL: string, APPROVE_LIST_URL: string, credentials: { username: string; password: string }) {
    await test.step('Admin Login', async () => {
    log(`Navigating to admin login URL: ${ADMIN_URL}`);
    await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded' });

    log(`Filling UserID: ${credentials.username}, Password: ${credentials.password}`);
    await page.getByRole('textbox', { name: 'User ID' }).fill(credentials.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(APPROVE_LIST_URL, { timeout: 10000 });

    log('Admin login successful.');
    });
  }

  static async getAdminSubscription(page: Page): Promise<string> {
    return await test.step('Get Admin Subscription', async () => {
    const subscription = await page.locator("//h5[text()=' ADMIN Subscriptions ']/following-sibling::p").textContent();
    const trimmed = subscription?.trim() || '';
    log(`Fetched admin subscription value: ${trimmed}`);

    const subscriptions = trimmed.split(',').map(s => s.trim());
    const firstSubscription = subscriptions[0]; // or subscriptions.at(-1) for last
    log(`Using first subscription value: ${firstSubscription}`);

    // Handle deletion if visible
    const deleteImageLocator = `(//div[contains(text(),'${firstSubscription}')]/ancestor::div[@class='row mx-1 mt-4 approve approve-bottm']//img[contains(@src,'delete.jpg')])[1]`;
    const deleteImage = page.locator(deleteImageLocator);
    const isDeleteImageVisible = await deleteImage.isVisible();
    if (isDeleteImageVisible) {
      await deleteImage.click();
      log('Delete image clicked');
    } else {
      log('Delete image is not visible');
    }
  
    // Check for approval
    await page.getByRole('tab', { name: 'Approved' }).click();
    log('Clicked on "Approved" tab.');
    const approvedLocator = await page.locator(`(//div[text()=' ${firstSubscription} ']/following-sibling::div)[2]`);
    if (await approvedLocator.isVisible()) {
      await approvedLocator.click();
      await expect(page.getByText(`Table ID ${firstSubscription} deleted`)).toBeVisible();
      log(`Subscription "${firstSubscription}" was approved and removed.`);
    }

    return firstSubscription;
    });
  }

  static async userSubmitRequest(page: Page, USER_URL: string, subscriptionValue: string) {
    return await test.step('User Submits Request', async () => {
    const randomMobile = this.generateMobileNumber();
    const randomName = this.generateName();
    const fullUrl = `${USER_URL}${subscriptionValue}`;

    log(`Navigating to user QR login URL: ${fullUrl}`);
    await page.goto(fullUrl);
    log(`Filling mobile: ${randomMobile}, name: ${randomName}`);

    await page.locator('#ion-input-0').fill(randomMobile);
    await page.locator('#ion-input-1').fill(randomName);
    await page.getByRole('button', { name: 'STEP-IN -Taste Awaits' }).click();
    await page.waitForSelector(`text=${randomMobile}`, { timeout: 10000 });
    log('User request submitted and confirmed via mobile number visibility.');
    return randomMobile;
    });

  }

  static async checkElementsVisibility(page: Page, Restaurant_Name: string, Resturant_ID: string, mobileNumber: string, subscriptionValue: string) {
    const elementsToCheck = [
      'Waiting for Approval',
      `Restaurant Name:${Restaurant_Name}`,
      `Restaurant ID:${Resturant_ID}`,
      `Mobile Number${mobileNumber}`,
      `Table No:${subscriptionValue}`,
    ];

    for (const text of elementsToCheck) {
      const element = page.getByText(text);
      await expect(element).toBeVisible();
      console.log(`Verified visibility of element with text: ${text}`);
    }
  }

  static async checkAndApproveRequest(page: Page, APPROVE_LIST_URL: string, subscriptionValue: string) {
    await test.step('Check and Approve User Request', async () => {
    await page.bringToFront();
    await page.reload();
    await expect(page).toHaveURL(APPROVE_LIST_URL);
    log('Verifying on Approve List page.');
    const addImageLocator = `(//div[contains(text(),'${subscriptionValue}')]/ancestor::div[@class='row mx-1 mt-4 approve approve-bottm']//img[contains(@src,'add.jpg')])[1]`;
    const addImage = page.locator(addImageLocator);
    await expect(addImage).toBeVisible();
    await addImage.click();
    log(`Clicked on the first request with subscription value: ${subscriptionValue}`);    
    await page.waitForTimeout(5000);
  });
  }

  static async searchAndPlaceOrder(page: Page, dishName: string, userCount: number) {
    await page.bringToFront();
    await page.reload();
    await page.waitForTimeout(3000);
    await page.getByRole('textbox', { name: 'Search for dishes' }).fill(dishName);

    const heading = page.getByRole('heading', { name: dishName }).locator('span');
    await expect(heading).toBeVisible();
    log(`Dish "${dishName}" found in search.`);

    for (let i = 0; i < userCount; i++) {
      await page.locator('.col-2').click();
      await page.getByRole('button', { name: 'Yes' }).click();
      await page.waitForTimeout(2000);
      await expect(page.getByRole('button', { name: 'Placed' })).toBeVisible();
      
      const placedBtn = page.locator(`//h5[.//span[normalize-space(text())='${dishName}']]/ancestor::div[contains(@class, 'row')]/following-sibling::div//button[contains(normalize-space(), 'Placed')]`);
      log(await placedBtn.isVisible() ? 'Order placed.' : 'Order not placed.');
    }
  }

  static async kotLogin(page: Page, KOT_URL: string, Order_LIST_URL: string, credentials: { username: string; password: string }) {
    await test.step('KOT Login', async () => {
    log(`Navigating to KOT login URL: ${KOT_URL}`);
    await page.bringToFront();
    await page.waitForTimeout(3000);
    await page.goto(KOT_URL);
    log(`Filling UserID: ${credentials.username}, Password: ${credentials.password}`);
    await page.getByRole('textbox', { name: 'User ID' }).fill(credentials.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(Order_LIST_URL);
    log('KOT login successful.');
    });
  }


  static async prepareAndDispatchOrder(page: Page, dishName: string) {
    await test.step(`Prepare and Dispatch order for: ${dishName}`, async () => {
      log(`Clicking on 'List' to view current orders`);
      await page.locator("//button[normalize-space(text())='List']").click();
  
      const getDishActionButton = (action: 'Started' | 'Dispatched') =>
        page.locator(`//div[text()[contains(., '${dishName}')]]/ancestor::div[contains(@class, 'table-row')]//button[text()='${action}']`);
  
      await getDishActionButton('Started').click();
      await page.waitForTimeout(5000);
      await getDishActionButton('Dispatched').click();
  
      log(`Order marked as Started and Dispatched: ${dishName}`);
    });
  }

  static async checkOrderStatus(page: Page, dishName: string, status: 'Started' | 'Dispatched' | 'Delivered') {
    await page.bringToFront();
    await page.reload();
    await page.waitForTimeout(2000);
    const statusBtn = page.locator(`//h5[contains(., '${dishName}']]/ancestor::div[contains(@class, 'row')]/following-sibling::div//button[contains(., '${status}')]`);
    log(await statusBtn.isVisible() ? `Order in ${status} status.` : `Order not in ${status} status.`);
  }

  static async moveOrderStatus(page: Page, dishName: string, status: 'Return to kot' | 'Done'){
    await page.bringToFront();
    await page.reload();
    await page.waitForTimeout(3000);
    const btn = page.locator(`//div[contains(text(), '${dishName}')]/ancestor::div[@class='row table table-row']//button[text()='${status}']`);
    log(await btn.isVisible() ? `Order in Delivered status.` : `Order not in Delivered status.`);

    }

  private static generateMobileNumber(): string {
    const start = ['6', '7', '8', '9'][Math.floor(Math.random() * 4)];
    return start + Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  }

  private static generateName(): string {
    const base = ['dinesh', 'manoj', 'kumar', 'arun', 'sathish', 'ravi', 'kishore'];
    const name = base[Math.floor(Math.random() * base.length)];
    const suffix = Date.now().toString().slice(-4); // last 4 digits of timestamp
    return `${name}${suffix}`;
  }
  
}

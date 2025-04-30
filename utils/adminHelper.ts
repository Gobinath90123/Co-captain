import { Page, expect, test } from '@playwright/test';

function log(message: string) {
  console.log(`[AdminHelper] ${new Date().toISOString()} - ${message}`);
}

export class AdminHelper {

  static async login(page: Page, loginUrl: string, successUrl: string, credentials: { username: string; password: string }, role: string) {
    await test.step(`${role} Login`, async () => {
      log(`Navigating to ${role} login URL: ${loginUrl}`);
      await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  
      log(`Filling ${role} credentials - Username: ${credentials.username}`);
      await page.getByRole('textbox', { name: 'User ID' }).fill(credentials.username);
      await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Login' }).click();
      await expect(page).toHaveURL(successUrl, { timeout: 5000 });
      log(`${role} login successful.`);
    });
  }
  
  static async getAdminSubscription(page: Page): Promise<string> {
    return await test.step('Get Admin Subscription', async () => {
    const rawText = await page.locator("//h5[text()=' ADMIN Subscriptions ']/following-sibling::p").textContent();
    const firstSubscription = (rawText?.trim().split(',')[0] || '').trim();
    log(`Using subscription: ${firstSubscription}`);

    // Handle deletion if visible
    const deleteIcon = `(//div[contains(text(),'${firstSubscription}')]/ancestor::div[contains(@class,'approve')]//img[contains(@src,'delete.jpg')])[1]`;
    const deleteImage = page.locator(deleteIcon);
    const isDeleteImageVisible = await deleteImage.isVisible();
    if (isDeleteImageVisible) {
      await deleteImage.click();
      log('Delete image clicked');
    }
    await page.waitForTimeout(2000);
    // Check for approval
    await page.getByRole('tab', { name: 'Approved' }).click();
    log('Clicked on "Approved" tab.');
    const approvedEntry = page.locator(`(//div[text()=' ${firstSubscription} ']/following-sibling::div)[2]`);
    if (await approvedEntry.isVisible()) {
      await approvedEntry.click();
      await expect(page.getByText(`Table ID ${firstSubscription} deleted`)).toBeVisible();
      log(`Subscription ${firstSubscription} deleted.`);
    }
    await page.waitForTimeout(2000);
    return firstSubscription;
    });
  }

  static async userSubmitRequest(page: Page, USER_URL: string, subscriptionValue: string) {
    return await test.step('User Submits Request', async () => {
    const mobile = this.generateMobileNumber();
    const name = this.generateName();
    const fullUrl = `${USER_URL}${subscriptionValue}`;

    log(`Navigating to user QR login URL: ${fullUrl}`);
    await page.goto(fullUrl);
    await page.locator('#ion-input-0').fill(mobile);
    await page.locator('#ion-input-1').fill(name);
    await page.getByRole('button', { name: 'STEP-IN -Taste Awaits' }).click();
    await page.waitForSelector(`text=${mobile}`, { timeout: 10000 });
    log(`Request submitted with mobile: ${mobile}, name: ${name}`);
    return mobile;
    });

  }

  static async checkElementsVisibility(page: Page, Restaurant_Name: string, Resturant_ID: string, mobileNumber: string, subscriptionValue: string) {
    const elements = [
      'Waiting for Approval',
      `Restaurant Name:${Restaurant_Name}`,
      `Restaurant ID:${Resturant_ID}`,
      `Mobile Number${mobileNumber}`,
      `Table No:${subscriptionValue}`,
    ];

    for (const text of elements) {
      await expect(page.getByText(text)).toBeVisible();
      log(`Verified visibility: ${text}`);
    }
  }

  static async checkAndApproveRequest(page: Page, APPROVE_LIST_URL: string, subscription: string) {
    await test.step('Verifying on Menu Request List page. Clicking on Add Icon to Approve Request', async () => {
    await page.bringToFront();
    await page.reload();
    await expect(page).toHaveURL(APPROVE_LIST_URL);
    const addIcon = page.locator(`(//div[contains(text(),'${subscription}')]/ancestor::div[contains(@class,'approve')]//img[contains(@src,'add.jpg')])[1]`);
    await expect(addIcon).toBeVisible();
    await addIcon.click();
    await page.waitForTimeout(5000);
    log(`Approved request for subscription: ${subscription}`);
  });
  }

  static async checkUserApproved(page: Page, APPROVE_LIST_URL: string, subscription: string) {
    await test.step('Check Approval Status', async () => {
    await page.bringToFront();
    await page.reload();
    await expect(page).toHaveURL(APPROVE_LIST_URL);
    await page.getByRole('tab', { name: 'Approved' }).click();
    await page.waitForTimeout(2000);
    log('Clicked on "Approved" tab.');
    await expect(page.locator(`//div[text()=' ${subscription} ']`)).toBeVisible();
    log(`Verified approved user for subscription: ${subscription}`);
  });
  }

  static async searchAndPlaceOrder(page: Page, dish: string, count: number) {
    await page.bringToFront();
    await page.reload();
    await page.waitForTimeout(3000);
    await page.getByRole('textbox', { name: 'Search for dishes' }).fill(dish);
    await expect(page.getByRole('heading', { name: dish }).locator('span')).toBeVisible();
    log(`Dish "${dish}" found in search.`);

    for (let i = 0; i < count; i++) {
      await page.locator('.col-2').click();
      await page.getByRole('button', { name: 'Yes' }).click();
      await page.waitForTimeout(2000);
      await expect(page.getByRole('button', { name: 'Placed' })).toBeVisible();
    }
    log(`Order placed for ${dish}, count: ${count}`);

  }

  static async openOrderListView(page: Page) {
    await test.step("Open order list view", async () => {
      log("Clicking on 'List' to view current orders");
      await page.locator("//button[normalize-space(text())='List']").click();
    });
  }

  static async prepareAndDispatchOrder(page: Page, dish: string, finalAction: 'Started' | 'Dispatched') {
    await test.step(`Update order status for dish: ${dish} up to ${finalAction}`, async () => {
      await AdminHelper.openOrderListView(page);
      
      const getBtn = (status: string) =>
        page.locator(`//div[text()[contains(., '${dish}')]]/ancestor::div[contains(@class, 'table-row')]//button[text()='${status}']`);
      if (finalAction === 'Started') {
        await getBtn('Started').click();
      } else if (finalAction === 'Dispatched') {
        await getBtn('Dispatched').click();
      }
      log(`Dish '${dish}' moved to ${finalAction}`);
      await page.waitForTimeout(2000);
    });
  }

  static async checkOrderStatus(page: Page, dish: string, status: 'Placed' |'Started' | 'Dispatched' | 'Delivered') {
    await page.bringToFront();
    await page.reload();
    await page.waitForTimeout(2000);
    const statusBtn = page.locator(`//span[normalize-space()='${dish}']/ancestor::div[contains(@class, 'card-body')]/ancestor::div[contains(@class, 'row')]/following-sibling::div//button[contains(., '${status}')]`);
    log(await statusBtn.isVisible() ? `Order in ${status} status.` : `Order not in ${status} status.`);
    await page.waitForTimeout(2000);
  }

  static async moveOrderStatus(page: Page, dish: string, status: 'Return to kot' | 'Done'){
    await page.bringToFront();
    await page.waitForTimeout(3000);
    const btn = page.locator(`//div[contains(text(), '${dish}')]/ancestor::div[@class='row table table-row']//button[text()='${status}']`);
    if (await btn.isVisible()) {
      await btn.click();
      log(`Order status moved to ${status}.`);
    } else {
      log(`Order not in expected status: ${status}.`);
    }

    await page.waitForTimeout(2000);
  }


  static async switchToOrderListPage(page: Page) {
    await page.bringToFront();
    await page.waitForTimeout(2000);
    log("Navigating to Orders tab...");
    await page.locator("//ion-tab-button[normalize-space(.//ion-label)='Orders']").click();
    await page.waitForURL('http://uatguestuser.cocaptain.co.in/#/home/tabs/order-list'),
    await page.waitForTimeout(2000);
    const askForBillBtn = page.locator("//button[normalize-space(text())='Ask For Bill']");
    await expect(askForBillBtn).toBeVisible();
    await askForBillBtn.click();
    log("Clicked 'Ask For Bill' button.");
    await page.waitForTimeout(2000);
    await expect(page.locator("//div[contains(@class, 'banner-text')]")).toBeVisible();
    log("Banner text visible after requesting bill.");    
  }

  static async RequestedForBill(page: Page, APPROVE_LIST_URL: string, subscription: string) {
    await test.step('Request for bill Status', async () => {
    await page.bringToFront();
    await expect(page).toHaveURL(APPROVE_LIST_URL);
    await page.getByRole('tab', { name: 'Request for bill' }).click();
    await page.waitForTimeout(2000);
    log('Clicked on "Request for bill" tab.');
    await expect(page.locator(`//div[text()=' ${subscription} ']`)).toBeVisible();
    log(`Verified request for bill status for subscription: ${subscription}`);
  });
  }

  static async closeBill(page: Page, APPROVE_LIST_URL: string, subscription: string) {
    await test.step('Close bill Status', async () => {
    await page.bringToFront();
    // Wait and click the CloseBill label
    await page.locator("//ion-label[normalize-space()='CloseBill']").click();
    // Wait for the correct URL after clicking the CloseBill label
    await expect(page).toHaveURL("http://uatemployee.cocaptain.co.in/#/home/tabs/order-list");
    await page.waitForTimeout(2000);

    // Find and click the Close button for the corresponding order
    await page.locator("(//strong[text()='TMV1']/ancestor::div//button[contains(@class, 'close')])[2]").click();
  });
  }

  private static generateMobileNumber(): string {
    const start = ['6', '7', '8', '9'][Math.floor(Math.random() * 4)];
    return start + Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  }

  private static generateName(): string {
    const base = ['dinesh', 'manoj', 'kumar', 'arun', 'sathish', 'ravi', 'kishore'];
    const name = base[Math.floor(Math.random() * base.length)];
    const suffix = Date.now().toString().slice(-4);
    return `${name}${suffix}`;
  }
  
}

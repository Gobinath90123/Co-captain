import { Page, expect, test } from '@playwright/test';

function log(message: string) {
  console.log(`[AdminHelper] ${new Date().toISOString()} - ${message}`);
}

export class AdminHelper {
  static async adminLogin(page: Page, ADMIN_URL: string, APPROVE_LIST_URL: string, credentials: { username: string; password: string }) {
    await test.step('Admin Login', async () => {
    log(`Navigating to admin login URL: ${ADMIN_URL}`);
    await page.goto(ADMIN_URL);
    log(`Filling UserID: ${credentials.username}, Password: ${credentials.password}`);
    await page.getByRole('textbox', { name: 'User ID' }).fill(credentials.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(APPROVE_LIST_URL);
    log('Admin login successful.');
    });
  }

  static async getAdminSubscription(page: Page): Promise<string> {
    return await test.step('Get Admin Subscription', async () => {
    const subscription = await page.locator("//h5[text()=' ADMIN Subscriptions ']/following-sibling::p").textContent();
    const trimmedText = subscription?.trim() || '';
    log(`Fetched admin subscription value: ${trimmedText}`);

    const subscriptions = trimmedText.split(',').map(s => s.trim());
    const firstSubscription = subscriptions[1]; // or subscriptions.at(-1) for last
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
    const isApproved = await page.locator(`(//div[text()=' ${firstSubscription} ']/following-sibling::div)[2]`).isVisible();
    if (isApproved) {
      await page.locator(`(//div[text()=' ${firstSubscription} ']/following-sibling::div)[2]`).click();
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
    await page.getByRole('textbox', { name: 'Search for dishes' }).click();
    await page.getByRole('textbox', { name: 'Search for dishes' }).fill(dishName);

    const heading = page.getByRole('heading', { name: dishName }).locator('span');
    await expect(heading).toBeVisible();
    log(`Dish "${dishName}" found in search.`);

    for (let i = 0; i < userCount; i++) {
      await page.locator('.col-2').click();
      await expect(page.getByRole('heading', { name: 'Confirm' })).toBeVisible();
      await expect(page.getByText('Do you want to add this')).toBeVisible();
      await page.getByRole('button', { name: 'Yes' }).click();
  
      await expect(page.getByRole('button', { name: 'Placed' })).toBeVisible();
      console.log(`Dish "${dishName}" placed for user ${i + 1}.`);
      await expect(page.getByRole('status')).toBeVisible();

      const placedBtn = page.locator(`//h5[.//span[normalize-space(text())='${dishName}']]/ancestor::div[contains(@class, 'row')]/following-sibling::div//button[contains(normalize-space(), 'Placed')]`);
      if (await placedBtn.isVisible()) {
      console.log('Order is in Placed status');
      } else {
      console.log('Order is not in Placed status');
      }
    }
  }



  static async kotLogin(page: Page, KOT_URL: string, Order_LIST_URL: string, credentials: { username: string; password: string }) {
    await test.step('Admin Login', async () => {
    log(`Navigating to admin login URL: ${KOT_URL}`);
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
        page.locator(
          `//div[text()[contains(., '${dishName}')]]/ancestor::div[contains(@class, 'table-row')]//button[text()='${action}']`
        );
  
      log(`Marking dish "${dishName}" as Started`);
      await getDishActionButton('Started').click();

      log(`Waiting 5 seconds before marking as Dispatched`);
      await page.waitForTimeout(5000);
  
      log(`Marking dish "${dishName}" as Dispatched`);
      await getDishActionButton('Dispatched').click();
  
      log(`Dish "${dishName}" successfully marked as Started and Dispatched`);
    });
  }

  static async checkOrderStatus(page: Page, dishName: string, status: 'Started' | 'Dispatched'){
    await page.bringToFront();
    await page.reload();
    await page.waitForTimeout(2000);
    const dispatchBtn = page.locator(`//h5[.//span[normalize-space(text())='${dishName}']]/ancestor::div[contains(@class, 'row')]/following-sibling::div//button[contains(normalize-space(), '${status}')]`);
      if (await dispatchBtn.isVisible()) {
      console.log('Order is in Dispatched status');
      } else {
      console.log('Order is not in Dispatched status');
      }
    }
 
  private static generateMobileNumber(): string {
    const start = ['6', '7', '8', '9'][Math.floor(Math.random() * 4)];
    let number = start;
    for (let i = 0; i < 9; i++) {
      number += Math.floor(Math.random() * 10).toString();
    }
    return number;
  }

  private static generateName(): string {
    const names = ['dinesh', 'manoj', 'kumar', 'arun', 'sathish', 'ravi', 'kishore'];
    return names[Math.floor(Math.random() * names.length)];
  }


  static async serverLogin(page: Page, SERVER_URL: string,SERVER_list_URL: string, credentials: { username: string; password: string }) {
    await test.step('Admin Login', async () => {
    log(`Navigating to admin login URL: ${SERVER_URL}`);
    await page.bringToFront();
    await page.waitForTimeout(3000);
    await page.goto(SERVER_URL);
    log(`Filling UserID: ${credentials.username}, Password: ${credentials.password}`);
    await page.getByRole('textbox', { name: 'User ID' }).fill(credentials.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(SERVER_list_URL);
    log('Server login successful.');
    });
  }
  static async serverCheckOrderStatus(page: Page, SERVER_list_URL: string) {
    await page.bringToFront();
    await page.goto(SERVER_list_URL);
    await page.reload(); 
    await page.waitForTimeout(200000);

    if (await this.isReturnKOTButtonVisible(page)) {
      await this.handleReturnToKOT(page);
    } else if (await this.isDoneButtonVisible(page)) {
      await this.handleDoneButton(page);
    } else {
      console.warn('Neither "Return to kot" nor "Done" button was found.');
    }
  }

  private static async isReturnKOTButtonVisible(page: Page): Promise<boolean> {
    const returnKOTBtn = page.locator("//button[normalize-space()='Return to kot']");
    return await returnKOTBtn.isVisible();
  }

  private static async isDoneButtonVisible(page: Page): Promise<boolean> {
    const doneBtn = page.locator("//button[normalize-space()='Done']");
    return await doneBtn.isVisible();
  }

  private static async handleReturnToKOT(page: Page) {
    const returnKOTBtn = page.locator("//button[normalize-space()='Return to kot']");
    console.log('Return to KOT button is visible. Clicking...');
    await returnKOTBtn.click();
    await expect(page.getByText('Returned to KOT')).toBeVisible(); // Adjust text as needed
  }

  private static async handleDoneButton(page: Page) {
    const doneBtn = page.locator("//button[normalize-space()='Done']");
    console.log('Done button is visible. Clicking...');
    await doneBtn.click();
    await expect(page.getByText('Order marked as done')).toBeVisible(); // Adjust text as needed
  }
}

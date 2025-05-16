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
    const firstSubscription = (rawText?.trim().split(',')[1] || '').trim();
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
static async checkAndRejectRequest(page: Page, APPROVE_LIST_URL: string, subscription: string) {
  await test.step('Verifying on Menu Request List page. Clicking on Delete Icon to Reject Request', async () => {
    await page.bringToFront();
    await page.reload();
    await expect(page).toHaveURL(APPROVE_LIST_URL);
    
    // Locate the delete icon next to the specific subscription
    const deleteIcon = page.locator(`(//div[contains(text(),'${subscription}')]/ancestor::div[contains(@class,'approve')]//div[@class='col-6']/following-sibling::div[1])[1]`);
    
    await expect(deleteIcon).toBeVisible();
    await deleteIcon.click();
    await page.waitForTimeout(5000); // Optional, depends on UI behavior

    log(`Rejected request for subscription: ${subscription}`);
  });
}

static async verifyRejectionMessage(page: Page) {
  await test.step('Verifying rejection toaster message appears briefly and matches expected text', async () => {
    try {
      // Wait for shadow host to appear (replace with actual tag name or class)
      await page.waitForSelector('custom-toast', { timeout: 5000 });
      const shadowHost = await page.$('custom-toast'); // Adjust if it's a different element

      if (!shadowHost) throw new Error('Shadow host not found');

      // Access shadow root
      const shadowRootHandle = await shadowHost.evaluateHandle(el => el.shadowRoot);

      // Get the toaster message inside shadow DOM
      const messageHandle = await shadowRootHandle.evaluateHandle(root =>
        root.querySelector('div > div > div > div') // Replace with actual structure if known
      );

      if (!messageHandle) throw new Error('Toast message element not found inside shadow root');

      // Extract text content
      const messageText = await messageHandle.evaluate(el => el.textContent?.trim());

      expect(messageText).toBe('Your table has been deleted. Please contact the Restaurant admin.');
      log(`✅ Toast message verified: "${messageText}"`);
    } catch (error) {
      throw new Error(`❌ Rejection toast message not found or did not match. Details: ${error}`);
    }
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



static async  searchAndPlaceOrderForDifferentDishes(page: Page, dishNames: string[]) {
  for (const dish of dishNames) {
    // Clear search and enter new dish name
    const searchInput = page.locator('input[placeholder="Search for dishes"]'); // Adjust selector if needed
    await searchInput.fill(dish);
    await page.keyboard.press('Enter');

    // Wait for results to load
    await page.waitForTimeout(1000); 

    // Click on the add icon
    const addButton = page.locator("//div[contains(@class,'col-2 d-flex')]").first();
    if (await addButton.isVisible()) {
      await addButton.click();

      // Confirm with Yes
      const yesButton = page.locator("(//span[@class='alert-button-inner sc-ion-alert-md'])[2]");
      await yesButton.waitFor({ state: 'visible', timeout: 5000 });
      await yesButton.click();

      await page.waitForTimeout(800); // Optional pause
    } else {
      console.warn(`Add button not found for dish: ${dish}`);
    }
  }
}
static async searchAndAddDishesByMenuCategory(
    page: Page,
    categoryDishMap: Record<string, string[]>
  ) {
    for (const [category, dishes] of Object.entries(categoryDishMap)) {
      try {
        // Click the category button
        const categoryBtn = page.locator(`//button[normalize-space(text())='${category}']`);
        await categoryBtn.waitFor({ state: 'visible', timeout: 5000 });
        await categoryBtn.click();
        console.log(`✅ Clicked category: ${category}`);

        for (const dish of dishes) {
          try {
            // Fill the search input and press Enter
            const searchInput = page.locator('input[placeholder="Search for dishes"]');
            await searchInput.waitFor({ state: 'visible', timeout: 5000 });
            await searchInput.fill(dish);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000); // wait for results

            // Click the first "Add" button if available
            const addButton = page.locator("//div[contains(@class,'col-2 d-flex')]").first();
            if (await addButton.isVisible()) {
              await addButton.click();
              console.log(`➕ Add clicked for dish: ${dish}`);

              // Confirm with Yes
              const yesButton = page.locator("(//span[@class='alert-button-inner sc-ion-alert-md'])[2]");
              await yesButton.waitFor({ state: 'visible', timeout: 5000 });
              await yesButton.click();
              console.log(`✅ Confirmed add for: ${dish}`);

              await page.waitForTimeout(800); // optional pause
            } else {
              console.warn(`⚠️ Add button not found for dish: ${dish} in category: ${category}`);
            }
          } catch (dishError) {
            console.error(`❌ Error adding dish '${dish}' in category '${category}': ${dishError.message}`);
          }
        }
      } catch (categoryError) {
        console.error(`❌ Error with category '${category}': ${categoryError.message}`);
      }
    }
  }

  static async searchAndAddDishByCategory(
  page: Page,
  category: string,
  dish: string
) {
  try {
    // Click the category button
    const categoryBtn = page.locator(`//button[normalize-space(text())='${category}']`);
    await categoryBtn.waitFor({ state: 'visible', timeout: 5000 });
    await categoryBtn.click();
    console.log(`✅ Clicked category: ${category}`);

    // Fill the search input and press Enter
    const searchInput = page.locator('input[placeholder="Search for dishes"]');
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await searchInput.fill(dish);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000); // wait for results

    // Click the first "Add" button if available
    const addButton = page.locator("//div[contains(@class,'col-2 d-flex')]").first();
    if (await addButton.isVisible()) {
      await addButton.click();
      console.log(`➕ Add clicked for dish: ${dish}`);

      // Confirm with Yes
      const yesButton = page.locator("(//span[@class='alert-button-inner sc-ion-alert-md'])[2]");
      await yesButton.waitFor({ state: 'visible', timeout: 5000 });
      await yesButton.click();
      console.log(`✅ Confirmed add for: ${dish}`);

      await page.waitForTimeout(800); // optional pause
    } else {
      console.warn(`⚠️ Add button not found for dish: ${dish} in category: ${category}`);
    }
  } catch (error) {
    console.error(`❌ Error adding dish '${dish}' in category '${category}': ${error.message}`);
  }
}

  static async searchAndPlaceForMultipleOrder(page: Page, dish: string, count: number) {
    await page.bringToFront();
    await page.reload();
    await page.waitForTimeout(3000);
  
    await page.getByRole('textbox', { name: 'Search for dishes' }).fill(dish);
    await expect(page.getByRole('heading', { name: dish }).locator('span')).toBeVisible();
    log(`Dish "${dish}" found in search.`);
  
    // First Add Button + Confirmation
    await page.locator("(//div[@class='col-5']/following-sibling::div)[2]").click();
    await page.locator("//span[normalize-space()='Yes']").click();
    await page.waitForTimeout(2000);
  
    // Repeat for remaining count - 1 times
    for (let i = 1; i < count; i++) {
      await page.locator("//div[@class='row mb-2 animated-row']//span[3]").click();
      await page.locator("//span[normalize-space()='Yes']").click();
      await page.waitForTimeout(2000);
    }
  
    // Confirm final state (optional)
    await expect(page.getByRole('button', { name: 'Placed' })).toBeVisible();
    log(`Order placed for "${dish}" ${count} time(s).`);
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
      await page.waitForTimeout(5000);
    });
  }
static async updateOrderStatusforDifferentDishes(page: Page, dish: string, finalAction: 'Started' | 'Dispatched') {
  const getBtn = (status: string) =>
    page.locator(`//div[text()[contains(., '${dish}')]]/ancestor::div[contains(@class, 'table-row')]//button[text()='${status}']`);
  if (finalAction === 'Started') {
    await getBtn('Started').click();
  } else if (finalAction === 'Dispatched') {      
    await getBtn('Dispatched').click();
  }                                           
}

static async prepareAndDispatchOrderforDifferentDishes(page: Page, dish: string[], finalAction: 'Started' | 'Dispatched') {
  await test.step(`Update order status for dish: ${dish} up to ${finalAction}`, async () => {
    await AdminHelper.openOrderListView(page);
    for (const d of dish) {
      await AdminHelper.updateOrderStatusforDifferentDishes(page, d, finalAction);
    }
  });
}
static async  updateOrderStatusForDifferentDishes(
  page: Page,
  dishesByCategory: Record<string, string[]>
) {
  await test.step('Update order statuses for all placed dishes', async () => {
    // Step 1: Click the "List" view button
    const listViewButton = page.locator("//button[normalize-space(text())='List']");
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
      console.log("✅ Switched to 'List' view.");
    } else {
      console.warn("❌ 'List' view button not found or not visible.");
    }

    // Step 2: Flatten all dishes into a single array
    const allDishes: string[] = Object.values(dishesByCategory).flat();

    // Step 3: Click "Started" for all dishes
    for (const dish of allDishes) {
      const startedButton = page.locator(
        `//div[contains(text(), "${dish}")]/ancestor::div[contains(@class, "table-row")]//button[contains(text(), "Started")]`
      );

      if (await startedButton.isVisible()) {
        await startedButton.click();
        console.log(`✅ Dish '${dish}' moved to 'Started' status.`);
      } else {
        console.warn(`❌ 'Started' button not found for dish: '${dish}'`);
      }

      await page.waitForTimeout(500);
    }

    // Step 4: Click "Dispatched" for all dishes
    for (const dish of allDishes) {
      const dispatchedButton = page.locator(
        `//div[contains(text(), "${dish}")]/ancestor::div[contains(@class, "table-row")]//button[contains(text(), "Dispatched")]`
      );

      if (await dispatchedButton.isVisible()) {
        await dispatchedButton.click();
        console.log(`✅ Dish '${dish}' moved to 'Dispatched' status.`);
      } else {
        console.warn(`❌ 'Dispatched' button not found for dish: '${dish}'`);
      }

      await page.waitForTimeout(500);
    }
  });
}

static async updateOrderStatusForDishAsStarted(
  page: Page,
  category: string, // kept for future extension or logging
  dish: string
) {
  await test.step('Update order status for a single dish to "Started"', async () => {
    // Step 1: Click the "List" view button
    const listViewButton = page.locator("//button[normalize-space(text())='List']");
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
      console.log("✅ Switched to 'List' view.");
    } else {
      console.warn("❌ 'List' view button not found or not visible.");
    }

    // Step 2: Click "Started" button for the given dish
    const startedButton = page.locator(
      `//div[contains(text(), "${dish}")]/ancestor::div[contains(@class, "table-row")]//button[contains(text(), "Started")]`
    );

    if (await startedButton.isVisible()) {
      await startedButton.click();
      console.log(`✅ Dish '${dish}' moved to 'Started' status.`);
    } else {
      console.warn(`❌ 'Started' button not found for dish: '${dish}'`);
    }

    // No action on "Dispatched"
    await page.waitForTimeout(500); // optional delay
  });
}
static async verifyDishRemovedInKOT2AfterKOT1Starts(
  kotPage1: Page,
  kotPage2: Page,
  category: string,
  dish: string
) {
  await test.step(`Start dish '${dish}' in KOT1 and verify removal from KOT2`, async () => {
    // -------- KOT 1 Actions --------
    // Step 1: Switch to List view in KOT1
    const listViewBtnKOT1 = kotPage1.locator("//button[normalize-space(text())='List']");
    if (await listViewBtnKOT1.isVisible()) {
      await listViewBtnKOT1.click();
      console.log("✅ KOT1: Switched to 'List' view.");
    }

    // Step 2: Start the dish in KOT1
    const startButtonKOT1 = kotPage1.locator(
      `//div[contains(text(),"${dish}")]/ancestor::div[contains(@class,"table-row")]//button[contains(text(),"Started")]`
    );
    if (await startButtonKOT1.isVisible()) {
      await startButtonKOT1.click();
      console.log(`✅ KOT1: Dish '${dish}' moved to 'Started'.`);
    } else {
      throw new Error(`❌ KOT1: 'Started' button not found for dish '${dish}'`);
    }

    // Give time for state sync
    await kotPage1.waitForTimeout(2000);

    // -------- KOT 2 Actions --------
    // Step 3: Switch to List view in KOT2
    const listViewBtnKOT2 = kotPage2.locator("//button[normalize-space(text())='List']");
    if (await listViewBtnKOT2.isVisible()) {
      await listViewBtnKOT2.click();
      console.log("✅ KOT2: Switched to 'List' view.");
    }

    // Step 4: Check that dish is no longer present in KOT2
    const dishInKOT2 = kotPage2.locator(
      `//div[contains(text(),"${dish}")]/ancestor::div[contains(@class,"table-row")]`
    );

    await expect(dishInKOT2).toHaveCount(0);
    console.log(`✅ Dish '${dish}' successfully removed from KOT2 after starting in KOT1.`);
  });
}



static async updateOrderStatusForDishAsDispatched(
  page: Page,
  category: string, // kept for consistency/logging
  dish: string
) {
  await test.step('Dispatch a started dish', async () => {
    // Step 1: Click the "List" view button
    const listViewButton = page.locator("//button[normalize-space(text())='List']");
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
      console.log("✅ Switched to 'List' view.");
    } else {
      console.warn("❌ 'List' view button not found or not visible.");
    }

    // Step 2: Click "Dispatched" button for the given dish
    const dispatchedButton = page.locator(
      `//div[contains(text(), "${dish}")]/ancestor::div[contains(@class, "table-row")]//button[contains(text(), "Dispatched")]`
    );

    if (await dispatchedButton.isVisible()) {
      await dispatchedButton.click();
      console.log(`✅ Dish '${dish}' moved to 'Dispatched' status.`);
    } else {
      console.warn(`❌ 'Dispatched' button not found for dish: '${dish}'`);
    }

    await page.waitForTimeout(500); // Optional delay
  });
}
  static async prepareAndDispatchForMultipleOrder(page: Page, dish: string, finalAction: string) {
    await test.step(`Update order status for dish: ${dish} up to ${finalAction}`, async () => {
      await AdminHelper.openOrderListView(page);
  
      // Click on "Consolidate" button
      await page.locator("//button[normalize-space(text())='Consolidate']").click();
      await page.waitForTimeout(2000);
        await page.locator("xpath=.//button[contains(@class,'btn btn-primary')]").click();
        await page.waitForTimeout(2000);
        await page.locator("xpath=.//button[contains(@class,'btn btn-success')]").click();
        await page.waitForTimeout(1500); // slight delay between actions
      
  
        log(`Dish '${dish}' moved to ${finalAction}`);
      await page.waitForTimeout(3000);
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
static async checkOrderStatusforDifferentDishes(
    page: Page,
    dishesByCategory: Record<string, string[]>,
    status: 'Placed' | 'Started' | 'Dispatched' | 'Delivered'
  ) {
    await page.bringToFront();
    await page.reload();
    await page.waitForTimeout(2000);

    const allDishes: string[] = Object.values(dishesByCategory).flat();

    for (const dish of allDishes) {
      const statusBtn = page.locator(
        `//span[normalize-space()='${dish}']/ancestor::div[contains(@class, 'card-body')]/ancestor::div[contains(@class, 'row')]/following-sibling::div//button[contains(., '${status}')]`
      );

      if (await statusBtn.isVisible()) {
        console.log(`✅ Dish '${dish}' is in '${status}' status.`);
      } else {
        console.warn(`❌ Dish '${dish}' is NOT in '${status}' status.`);
      }

      await page.waitForTimeout(1000); // Optional delay between checks
    }

    await page.waitForTimeout(1000); // Final delay
  }

  static async checkOrderStatusForDish(
  page: Page,
  category: string, // still accepting in case you want to log it or use later
  dish: string,
  expectedStatus: 'Placed' | 'Started' | 'Dispatched' | 'Delivered'
) {
  try {
    await page.bringToFront();
    await page.reload();
    await page.waitForTimeout(2000);

    const statusLocator = page.locator(
      `//span[normalize-space()='${dish}']/ancestor::div[contains(@class, 'card-body')]/ancestor::div[contains(@class, 'row')]/following-sibling::div//button[contains(., '${expectedStatus}')]`
    );

    const isVisible = await statusLocator.isVisible();

    if (isVisible) {
      console.log(`✅ '${dish}' in category '${category}' is in '${expectedStatus}' status.`);
    } else {
      console.warn(`❌ '${dish}' in category '${category}' is NOT in '${expectedStatus}' status.`);
    }

    await page.waitForTimeout(1000); // Optional delay
  } catch (error) {
    console.error(`❌ Error checking order status for dish '${dish}': ${error.message}`);
  }
}
static async checkOrderStatusForMultipleDishes(
    page: Page,
    dishesByCategory: Record<string, string[]>,
    expectedStatus: 'Placed' | 'Started' | 'Dispatched' | 'Delivered'
  ) {
    await page.bringToFront();
    await page.reload();
    await page.waitForTimeout(2000);

    const allDishes: string[] = Object.values(dishesByCategory).flat();

    for (const dish of allDishes) {
      // Updated locator based on your working pattern
      const statusLocator = page.locator(
        `//span[normalize-space()='${dish}']/ancestor::div[contains(@class, 'card-body')]/ancestor::div[contains(@class, 'row')]/following-sibling::div//button[contains(., '${expectedStatus}')]`
      );

      const isVisible = await statusLocator.isVisible();

      if (isVisible) {
        console.log(`✅ '${dish}' is in '${expectedStatus}' status.`);
      } else {
        console.warn(`❌ '${dish}' is NOT in '${expectedStatus}' status.`);
      }

      await page.waitForTimeout(1000); // Optional delay between checks
    }
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

  static async moveMultipleOrderStatus(page: Page) {
    await page.bringToFront();
    await page.waitForTimeout(3000);
  
    // Continuously click the first visible button until none remain
    while (true) {
      const buttons = page.locator("xpath=//button[@class='no-margin styled-button']");
      const count = await buttons.count();
  
      if (count === 0) break;
  
      const button = buttons.first();
  
      // Check visibility before clicking
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(300); // short delay to allow DOM update
      } else {
        break; // stop if the remaining button isn't interactable
      }
    }
  
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForTimeout(2000);
  }
  static async moveOrderStatusForDish(
  page: Page,
  category: string, // retained for logging or future logic
  dish: string,
  status: 'Return to kot' | 'Done'
) {
  await page.bringToFront();
  await page.waitForTimeout(2000);

  const statusButton = page.locator(
    `//div[contains(text(), '${dish}')]/ancestor::div[@class='row table table-row']//button[normalize-space(text())='${status}']`
  );

  if (await statusButton.isVisible()) {
    await statusButton.click();
    console.log(`✅ '${dish}' in category '${category}' moved to '${status}' status.`);
  } else {
    console.warn(`❌ '${dish}' in category '${category}' could not be moved to '${status}' or button not found.`);
  }

  await page.waitForTimeout(1000); // Optional pause
}

static async moveOrderStatusforCategoryMenu(
    page: Page,
    dishesByCategory: Record<string, string[]>,
    status: 'Return to kot' | 'Done'
  ) {
    await page.bringToFront();
    await page.waitForTimeout(2000);

    const allDishes = Object.values(dishesByCategory).flat();

    for (const dish of allDishes) {
      const statusButton = page.locator(
        `//div[contains(text(), '${dish}')]/ancestor::div[@class='row table table-row']//button[normalize-space(text())='${status}']`
      );

      if (await statusButton.isVisible()) {
        await statusButton.click();
        console.log(`✅ '${dish}' moved to '${status}' status.`);
      } else {
        console.warn(`❌ '${dish}' is NOT in '${status}' status or button not found.`);
      }

      await page.waitForTimeout(1000); // Optional wait between clicks
    }

    await page.waitForTimeout(1000);
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

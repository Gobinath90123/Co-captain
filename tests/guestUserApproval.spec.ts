import { test, expect, chromium, Page, devices  } from '@playwright/test';

// Configuration (can be moved to a separate file for better maintenance)
const ADMIN_CREDENTIALS = { username: 'rajesh', password: 'Test@123' };
const USER_URL = 'http://uatguestuser.cocaptain.co.in/#/qr-login/x713fo2tx5/';
const ADMIN_URL = 'http://uatemployee.cocaptain.co.in/#/login/x713fo2tx5';
const APPROVE_LIST_URL = 'http://uatemployee.cocaptain.co.in/#/home/tabs/approve-list';

test.use({
    ...devices['iPhone 11'], // You can replace 'iPhone 11' with other device types if needed
  });


// Test Suite
test.describe('@gopi', () => {
  test('User submits request and admin approves it', async () => {
    // 1. Launch the browser and create contexts
    const browser = await chromium.launch();
    const adminContext = await browser.newContext();
    const userContext = await browser.newContext();

    // 2. Admin logs in and approves the request
    const adminPage = await adminContext.newPage();
    await adminLogin(adminPage);
    await adminPage.bringToFront();

    // Fetch admin subscription value
    const subscriptionValue = await getAdminSubscription(adminPage);

    // 3. User submits request
    const userPage = await userContext.newPage();
    await userSubmitRequest(userPage, subscriptionValue);

    // 4. Admin checks for the request and approves it
    await adminPage.bringToFront();
    await adminPage.reload();
    await checkAndApproveRequest(adminPage, subscriptionValue);
    
    await userPage.bringToFront();
    await userPage.reload();
    await userPage.waitForTimeout(3000);
    await browser.close();
  });
});

// Admin Login Function
async function adminLogin(page: Page) {
  await page.goto(ADMIN_URL);
  await page.getByRole('textbox', { name: 'User ID' }).fill(ADMIN_CREDENTIALS.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_CREDENTIALS.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(APPROVE_LIST_URL);
}

// Get Admin Subscription Value
async function getAdminSubscription(page: Page): Promise<string> {
    const subscription = await page.locator("//h5[text()=' ADMIN Subscriptions ']/following-sibling::p").textContent();
    const trimmedSubscription = subscription?.trim() || '';
    console.log('Admin Subscriptions Value:', trimmedSubscription);


    await page.getByRole('tab', { name: 'Approved' }).click();

    const isApproved = await page.getByLabel('Approved').getByText(trimmedSubscription).isVisible();
    if (isApproved) {
        // Perform actions only if 'TMV1' is visible
        await page.getByRole('tabpanel', { name: 'Approved' }).getByRole('img').click();
        await expect(page.getByText('Table ID TMV1 deleted')).toBeVisible();
      }
  return trimmedSubscription;
}

// User Request Submission
async function userSubmitRequest(page: Page, subscriptionValue: string) {
  const randomMobile = generateMobileNumber();
  const randomName = generateName();
  await page.goto(`${USER_URL}${subscriptionValue}`);
  
  await page.locator('#ion-input-0').fill(randomMobile);
  await page.locator('#ion-input-1').fill(randomName);
  console.log(`Filling in user details: ${randomMobile}, ${randomName}`);
  
  await page.getByRole('button', { name: 'STEP-IN -Taste Awaits' }).click();
  await page.waitForSelector(`text=${randomMobile}`, { timeout: 10000 });  // Wait for mobile number to appear
}

// Admin checks and approves request0
async function checkAndApproveRequest(page: Page, mobileNumber: string) {
  await expect(page).toHaveURL(APPROVE_LIST_URL);
  const firstImage = page.getByRole('tabpanel', { name: 'Menu Request' }).getByRole('img').first();
  await expect(firstImage).toBeVisible();
  await firstImage.click();
  await page.waitForTimeout(5000);  // Adjust this based on the actual wait condition you need
}

// Utility Functions
function generateMobileNumber(): string {
  const start = ['6', '7', '8', '9'][Math.floor(Math.random() * 4)];
  let number = start;
  for (let i = 0; i < 9; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  return number;
}

function generateName(): string {
  const names = ['dinesh', 'manoj', 'kumar', 'arun', 'sathish', 'ravi', 'kishore'];
  return names[Math.floor(Math.random() * names.length)];
}






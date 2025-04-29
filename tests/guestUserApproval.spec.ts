import { test, chromium, devices } from '@playwright/test';
import { AdminHelper } from '../utils/adminHelper';

// Configuration (can be moved to a separate file for better maintenance)
const ADMIN_CREDENTIALS = { username: 'rajesh', password: 'Test@123' };
const KOT_CREDENTIALS = { username: 'kotcsf', password: 'Kotcsf1' };
const Resturant_ID = 'x713fo2tx5';
const Restaurant_Name ='Madurai Veedu';
const USER_URL = `http://uatguestuser.cocaptain.co.in/#/qr-login/${Resturant_ID}/`;
const ADMIN_URL = `http://uatemployee.cocaptain.co.in/#/login/${Resturant_ID}`;
const APPROVE_LIST_URL = 'http://uatemployee.cocaptain.co.in/#/home/tabs/approve-list';
const KOT_URL = `http://uatemployee.cocaptain.co.in/#/login/${Resturant_ID}`;
const Order_LIST_URL = 'http://uatemployee.cocaptain.co.in/#/home/tabs/order-list-kot';


test.use({ ...devices['iPhone 11'] });


// Test Suite
test.describe('@gopi', () => {
  test('User submits request and admin approves it', async () => {
    // 1. Launch the browser and create contexts
    const browser = await chromium.launch();
    const adminContext = await browser.newContext();
    const userContext = await browser.newContext();
    const kotContext = await browser.newContext();

    // 2. Admin logs in and approves the request
    const adminPage = await adminContext.newPage();
    await AdminHelper.adminLogin(adminPage, ADMIN_URL, APPROVE_LIST_URL, ADMIN_CREDENTIALS);

    // 3. Fetch admin subscription value
    const subscriptionValue = await AdminHelper.getAdminSubscription(adminPage);

    // 4. User submits request
    const userPage = await userContext.newPage();
    const mobileNumber = await AdminHelper.userSubmitRequest(userPage, USER_URL, subscriptionValue);

    // 5. User checks for the request
    await AdminHelper.checkElementsVisibility(userPage, Restaurant_Name, Resturant_ID, mobileNumber, subscriptionValue);

    // 6. Admin checks for the request and approves it
    await AdminHelper.checkAndApproveRequest(adminPage, APPROVE_LIST_URL, subscriptionValue);

    // 7. User places an order
    await AdminHelper.searchAndPlaceOrder(userPage, 'Chicken Biriyani', 1);

    const kotPage = await kotContext.newPage();
    await AdminHelper.kotLogin(kotPage, KOT_URL, Order_LIST_URL, KOT_CREDENTIALS);

    // 8. Approve order status
    await AdminHelper.prepareAndDispatchOrder(kotPage, 'Chicken Biriyani');
    
    // 9. Verify order status by user
    await AdminHelper.checkOrderStatus(userPage, 'Chicken Biriyani', 'Dispatched');

    // 10. Close the browser
    await browser.close();
  });
});
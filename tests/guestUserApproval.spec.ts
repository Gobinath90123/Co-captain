import { test, chromium, devices } from '@playwright/test';
import { AdminHelper } from '../utils/adminHelper';

// Configuration (could be moved to a config file)
const ADMIN_CREDENTIALS = { username: 'rajesh', password: 'Test@123' };
const KOT_CREDENTIALS = { username: 'kotcsf', password: 'Kotcsf1' };
const SERVER_CREDENTIALS = { username: 'mani1', password: 'Mani1' };

const RESTAURANT_ID = 'x713fo2tx5';
const RESTAURANT_NAME = 'Madurai Veedu';

const BASE_URL = 'http://uatemployee.cocaptain.co.in';
const USER_BASE_URL = 'http://uatguestuser.cocaptain.co.in';

const USER_URL = `${USER_BASE_URL}/#/qr-login/${RESTAURANT_ID}/`;
const ADMIN_URL = `${BASE_URL}/#/login/${RESTAURANT_ID}`;
const APPROVE_LIST_URL = `${BASE_URL}/#/home/tabs/approve-list`;
const KOT_URL = `${BASE_URL}/#/login/${RESTAURANT_ID}`;
const ORDER_LIST_URL = `${BASE_URL}/#/home/tabs/order-list-kot`;
const SERVER_LIST_URL = `${BASE_URL}/#/home/tabs/order-list-server`;
const SERVER_URL = `${BASE_URL}/#/login/${RESTAURANT_ID}`;

test.use({ ...devices['iPhone 11'] });

test.describe('@gopi', () => {
  test('User submits request and admin approves it', async () => {
    // 1. Launch the browser and create separate contexts
    const browser = await chromium.launch();
    const adminContext = await browser.newContext();
    const userContext = await browser.newContext();
    const kotContext = await browser.newContext();
    const serverContext = await browser.newContext();

    // 2. Admin logs in
    const adminPage = await adminContext.newPage();
    await AdminHelper.adminLogin(adminPage, ADMIN_URL, APPROVE_LIST_URL, ADMIN_CREDENTIALS);

    // 3. Fetch subscription value
    const subscriptionValue = await AdminHelper.getAdminSubscription(adminPage);

    // 4. User submits a request
    const userPage = await userContext.newPage();
    const mobileNumber = await AdminHelper.userSubmitRequest(userPage, USER_URL, subscriptionValue);

    // 5. User checks the request
    await AdminHelper.checkElementsVisibility(userPage, RESTAURANT_NAME, RESTAURANT_ID, mobileNumber, subscriptionValue);

    // 6. Admin approves the request
    await AdminHelper.checkAndApproveRequest(adminPage, APPROVE_LIST_URL, subscriptionValue);

    // 7. User places an order
    await AdminHelper.searchAndPlaceOrder(userPage, 'Chicken Biriyani', 1);

    // 8. KOT logs in and prepares the order
    const kotPage = await kotContext.newPage();
    await AdminHelper.kotLogin(kotPage, KOT_URL, ORDER_LIST_URL, KOT_CREDENTIALS);
    await AdminHelper.prepareAndDispatchOrder(kotPage, 'Chicken Biriyani');

    
    // 9. User verifies order is dispatched
    await AdminHelper.checkOrderStatus(userPage, 'Chicken Biriyani', 'Dispatched');

       // 10. Server logs in and handles order status
       const serverPage = await serverContext.newPage();
       await AdminHelper.serverLogin(serverPage, SERVER_URL, SERVER_LIST_URL, SERVER_CREDENTIALS);
       await AdminHelper.serverCheckOrderStatus(serverPage, APPROVE_LIST_URL);
    
 
    // 11. Optional: Close browser
    // await browser.close();
  });
});

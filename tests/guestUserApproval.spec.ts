import { test } from '@playwright/test';
import { AdminHelper } from '../utils/adminHelper';
import { testData } from '../fixture/testData';
import { launchBrowser, createAdminContext, createKotContext, createUserContext } from '../utils/browserHelper';

// Test Suite
test.describe('@E2E', () => {
  test('User submits request and admin approves it', async () => {
    // 1. Launch browser in headed mode with window size
    const browser = await launchBrowser();

    // 2. Create browser contexts for each role
    const adminContext = await createAdminContext(browser);
    const kotContext = await createKotContext(browser);
    const serverContext = await createKotContext(browser);
    const userContext = await createUserContext(browser);


    // 3. Admin logs in
    const adminPage = await adminContext.newPage();
    await AdminHelper.adminLogin(adminPage, testData.ADMIN_URL, testData.APPROVE_LIST_URL, testData.ADMIN_CREDENTIALS);

    // 4. Fetch subscription value from admin panel
    const subscriptionValue = await AdminHelper.getAdminSubscription(adminPage);

    // 5. User submits a request using mobile simulation
    const userPage = await userContext.newPage();
    const mobileNumber = await AdminHelper.userSubmitRequest(userPage, testData.USER_URL, subscriptionValue);

    // 6. User verifies the request details
    await AdminHelper.checkElementsVisibility(userPage, testData.RESTAURANT_NAME, testData.RESTAURANT_ID, mobileNumber, subscriptionValue);

    // 7. Admin approves the submitted request
    await AdminHelper.checkAndApproveRequest(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);

    // 8. User places an order
    await AdminHelper.searchAndPlaceOrder(userPage, 'Chicken Biriyani', 1);

    // 9. KOT logs in to manage orders
    const kotPage = await kotContext.newPage();
    await AdminHelper.kotLogin(kotPage, testData.KOT_URL, testData.ORDER_LIST_URL, testData.KOT_CREDENTIALS);

    // 10. KOT prepares and dispatches the order
    await AdminHelper.prepareAndDispatchOrder(kotPage, 'Chicken Biriyani');
    
    // 11. User verifies that the order status is updated
    await AdminHelper.checkOrderStatus(userPage, 'Chicken Biriyani', 'Dispatched');

    // 12. Server logs in to manage orders
    const serverPage = await serverContext.newPage();
    await AdminHelper.kotLogin(kotPage, testData.KOT_URL, testData.ORDER_LIST_URL, testData.KOT_CREDENTIALS);

    // 13. Server dispatches the order to user
    await AdminHelper.moveOrderStatus(serverPage, 'Chicken Biriyani', 'Done');

    // 11. User verifies that the order status is updated
    await AdminHelper.checkOrderStatus(userPage, 'Chicken Biriyani', 'Delivered');

    // 12. Close the browser
    await browser.close();
  });
});
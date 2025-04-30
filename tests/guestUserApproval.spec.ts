import { test } from '@playwright/test';
import { AdminHelper } from '../utils/adminHelper';
import { testData } from '../fixture/testData';
import { launchBrowserAt, createAdminContext, createKotContext, createUserContext } from '../utils/browserHelper';

// Test Suite
test.describe('@E2E', () => {
  test('User submits request and admin approves it', async () => {
    test.setTimeout(120_000);
    // 1. Launch browser in headed mode with window size

    // 2. Create browser contexts for each role
    const adminContext = await createAdminContext();
    const kotContext = await createKotContext();
    const serverContext = await createKotContext();
    const userContext = await createUserContext();


    // 3. Admin logs in
    const adminPage = await adminContext.newPage();
    await AdminHelper.login(adminPage, testData.ADMIN_URL, testData.APPROVE_LIST_URL, testData.ADMIN_CREDENTIALS, 'Admin');


    // 4. Fetch subscription value from admin panel
    const subscriptionValue = await AdminHelper.getAdminSubscription(adminPage);

    // 5. User submits a request using mobile simulation
    const userPage = await userContext.newPage();
    const mobileNumber = await AdminHelper.userSubmitRequest(userPage, testData.USER_URL, subscriptionValue);

    // 6. User verifies the request details
    await AdminHelper.checkElementsVisibility(userPage, testData.RESTAURANT_NAME, testData.RESTAURANT_ID, mobileNumber, subscriptionValue);

    // 7. Admin approves the submitted request
    await AdminHelper.checkAndApproveRequest(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);
    await AdminHelper.checkUserApproved(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);

    // 8. User places an order
    await AdminHelper.searchAndPlaceOrder(userPage, 'Chicken Biriyani', 1);
    await AdminHelper.checkOrderStatus(userPage, 'Chicken Biriyani', 'Placed');

    // 9. KOT logs in to manage orders
    const kotPage = await kotContext.newPage();
    await AdminHelper.login(kotPage, testData.KOT_URL, testData.ORDER_LIST_URL, testData.KOT_CREDENTIALS, 'KOT');

    // 10. KOT prepares and dispatches the order
    await AdminHelper.prepareAndDispatchOrder(kotPage, 'Chicken Biriyani', 'Started');
    await AdminHelper.prepareAndDispatchOrder(kotPage, 'Chicken Biriyani', 'Dispatched');
    
    // 11. User verifies that the order status is updated
    await AdminHelper.checkOrderStatus(userPage, 'Chicken Biriyani', 'Dispatched');

    // 12. Server logs in and completes order
    const serverPage = await serverContext.newPage();
    await AdminHelper.login(serverPage, testData.SERVER_URL, testData.SERVER_LIST_URL, testData.SERVER_CREDENTIALS, 'Server');
    await AdminHelper.moveOrderStatus(serverPage, 'Chicken Biriyani', 'Done');

    // 13. Final user check: order delivered
    await AdminHelper.checkOrderStatus(userPage, 'Chicken Biriyani', 'Delivered');

    //14. user switch to order list page
    await AdminHelper.switchToOrderListPage(userPage);
    await AdminHelper.RequestedForBill(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);
    await AdminHelper.closeBill(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);



  });
});
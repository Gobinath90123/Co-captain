import { test } from '@playwright/test';
import { AdminHelper } from '../utils/adminHelper';
import { testData } from '../fixture/testData';
import { launchBrowserAt, createAdminContext, createKotContext, createUserContext } from '../utils/browserHelper';


 const dishesByCategory = {
    "main Course": ['Nattukozhi pepper fry','Mutton boti masala (Gravy)'],
    "Chinese": ['Tandoori chicken Full'],
    "starter": ['Chinthamani Chicken'],
    "Non-Veg": ['Vanjaram Fry']
  };

// Test Suite
test.describe('@E2E', () => {
  test('User Placing an order with different dishes', async () => {
    test.setTimeout(120_000);
    
    // 1. Launch the browser in headed mode with a specified window size
    
    // 2. Create browser contexts for different roles
    const adminContext = await createAdminContext();
    const kotContext = await createKotContext();
    const serverContext = await createKotContext();
    const userContext = await createUserContext();

    // 3. Admin logs in
    const adminPage = await adminContext.newPage();
    await AdminHelper.login(adminPage, testData.ADMIN_URL, testData.APPROVE_LIST_URL, testData.ADMIN_CREDENTIALS, 'Admin');

    // 4. Fetch the subscription value from the admin panel
    const subscriptionValue = await AdminHelper.getAdminSubscription(adminPage);

    // 5. User submits a request using mobile simulation
    const userPage = await userContext.newPage();
    const mobileNumber = await AdminHelper.userSubmitRequest(userPage, testData.USER_URL, subscriptionValue);

    // 6. User verifies the request details
    await AdminHelper.checkElementsVisibility(userPage, testData.RESTAURANT_NAME, testData.RESTAURANT_ID, mobileNumber, subscriptionValue);

    // 7. Admin approves the submitted request
    await AdminHelper.checkAndApproveRequest(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);
    //check user is approved in admin flow  -- need to write script

    await AdminHelper.checkUserApproved(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);

    // 8. User places an order
    await AdminHelper.searchAndAddDishesByMenuCategory(userPage, dishesByCategory);  
  
  await AdminHelper.checkOrderStatusForMultipleDishes(userPage,  dishesByCategory, 'Placed');

    // 9. KOT logs in to manage orders
    const kotPage = await kotContext.newPage();
    await AdminHelper.login(kotPage, testData.KOT_URL, testData.ORDER_LIST_URL, testData.KOT_CREDENTIALS, 'KOT');

    // 10. KOT prepares and dispatches the order
    await AdminHelper.updateOrderStatusForDifferentDishes(kotPage, dishesByCategory);
    // await AdminHelper.prepareAndDispatchOrder(kotPage, menu, 'Dispatched');

    // 11. User checks if the order status has been updated
    await AdminHelper.checkOrderStatusforDifferentDishes(userPage,dishesByCategory, 'Dispatched');

    // 12. Server logs in and completes the order
    const serverPage = await serverContext.newPage();
    await AdminHelper.login(serverPage, testData.SERVER_URL, testData.SERVER_LIST_URL, testData.SERVER_CREDENTIALS, 'Server');
    await AdminHelper.moveOrderStatusforCategoryMenu(serverPage, dishesByCategory, 'Done');

    // 13. Final user check: confirm order is delivered
    await AdminHelper.checkOrderStatusforDifferentDishes(userPage,dishesByCategory, 'Delivered');

    // 14. User switches to the order list page
    await AdminHelper.switchToOrderListPage(userPage);
    await AdminHelper.RequestedForBill(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);
    await AdminHelper.closeBill(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);



  });
});
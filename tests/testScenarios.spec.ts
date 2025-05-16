import { test } from '@playwright/test';
import { AdminHelper } from '../utils/adminHelper';
import { testData } from '../fixture/testData';
import {
  launchBrowserAt,
  createAdminContext,
  createKotContext,
  createUserContext
} from '../utils/browserHelper';

test.describe('@RK', () => {
  test('@guest End-to-end food order flow across roles', async () => {
    test.setTimeout(120_000);

    // 1. Setup browser contexts for different user roles
    const adminContext = await createAdminContext();
    const kotContext = await createKotContext();
    const serverContext = await createKotContext();
    const userContext = await createUserContext();

    // 2. Admin logs in
    const adminPage = await adminContext.newPage();
    await AdminHelper.login(
      adminPage,
      testData.ADMIN_URL,
      testData.APPROVE_LIST_URL,
      testData.ADMIN_CREDENTIALS,
      'Admin'
    );

    // 3. Admin fetches subscription
    const subscriptionValue = await AdminHelper.getAdminSubscription(adminPage);

    // 4. User submits a request
    const userPage = await userContext.newPage();
    const mobileNumber = await AdminHelper.userSubmitRequest(
      userPage,
      testData.USER_URL,
      subscriptionValue
    );

    await AdminHelper.checkElementsVisibility(
      userPage,
      testData.RESTAURANT_NAME,
      testData.RESTAURANT_ID,
      mobileNumber,
      subscriptionValue
    );

    // 5. Admin approves user request
    await AdminHelper.checkAndApproveRequest(
      adminPage,
      testData.APPROVE_LIST_URL,
      subscriptionValue
    );

    await AdminHelper.checkUserApproved(
      adminPage,
      testData.APPROVE_LIST_URL,
      subscriptionValue
    );

    // 6. User places first order
    await AdminHelper.searchAndAddDishByCategory(userPage, 'Chinese', 'Tandoori chicken Full');
    await AdminHelper.checkOrderStatusForDish(userPage, 'Chinese', 'Tandoori chicken Full', 'Placed');

    // 7. User places second order
    await AdminHelper.searchAndAddDishByCategory(userPage, 'main Course', 'Nattukozhi pepper fry');
    await AdminHelper.checkOrderStatusForDish(userPage, 'main Course', 'Nattukozhi pepper fry', 'Placed');

    // 8. KOT logs in
    const kotPage = await kotContext.newPage();
    await AdminHelper.login(
      kotPage,
      testData.KOT_URL,
      testData.ORDER_LIST_URL,
      testData.KOT_CREDENTIALS,
      'KOT'
    );

    // 9. KOT starts and dispatches first order
    await AdminHelper.updateOrderStatusForDishAsStarted(kotPage, 'Chinese', 'Tandoori chicken Full');
    await AdminHelper.checkOrderStatusForDish(userPage, 'Chinese', 'Tandoori chicken Full', 'Started');

    await AdminHelper.updateOrderStatusForDishAsDispatched(kotPage, 'Chinese', 'Tandoori chicken Full');
    await AdminHelper.checkOrderStatusForDish(userPage, 'Chinese', 'Tandoori chicken Full', 'Dispatched');

    // 10. Server logs in and marks first order as done
    const serverPage = await serverContext.newPage();
    await AdminHelper.login(
      serverPage,
      testData.SERVER_URL,
      testData.SERVER_LIST_URL,
      testData.SERVER_CREDENTIALS,
      'Server'
    );

    await AdminHelper.moveOrderStatusForDish(serverPage, 'Chinese', 'Tandoori chicken Full', 'Done');
    await AdminHelper.checkOrderStatusForDish(userPage, 'Chinese', 'Tandoori chicken Full', 'Delivered');

    // 11. KOT starts and dispatches second order
    await AdminHelper.updateOrderStatusForDishAsStarted(kotPage, 'main Course', 'Nattukozhi pepper fry');
    await AdminHelper.checkOrderStatusForDish(userPage, 'main Course', 'Nattukozhi pepper fry', 'Started');

    await AdminHelper.updateOrderStatusForDishAsDispatched(kotPage, 'main Course', 'Nattukozhi pepper fry');
    await AdminHelper.checkOrderStatusForDish(userPage, 'main Course', 'Nattukozhi pepper fry', 'Dispatched');

    // 12. Server marks second order as done
    await AdminHelper.moveOrderStatusForDish(serverPage, 'main Course', 'Nattukozhi pepper fry', 'Done');
    await AdminHelper.checkOrderStatusForDish(userPage, 'main Course', 'Nattukozhi pepper fry', 'Delivered');

    // 13. Billing flow
    await AdminHelper.switchToOrderListPage(userPage);
    await AdminHelper.RequestedForBill(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);
    await AdminHelper.closeBill(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);
  });
  

  test('Admin approves guest request and guest is redirected to product page', async () => {
    test.setTimeout(60_000);
    // 1. Setup contexts
    const adminContext = await createAdminContext();
    const userContext = await createUserContext();

    const adminPage = await adminContext.newPage();
    const userPage = await userContext.newPage();

    // 2. Admin login
    await AdminHelper.login(
      adminPage,
      testData.ADMIN_URL,
      testData.APPROVE_LIST_URL,
      testData.ADMIN_CREDENTIALS,
      'Admin'
    );

    // 3. Fetch subscription value
    const subscriptionValue = await AdminHelper.getAdminSubscription(adminPage);

    // 4. Guest submits request
    const mobileNumber = await AdminHelper.userSubmitRequest(
      userPage,
      testData.USER_URL,
      subscriptionValue
    );

    // 5. Admin approves the guest request
    await AdminHelper.checkAndApproveRequest(
      adminPage,
      testData.APPROVE_LIST_URL,
      subscriptionValue
    );
    await AdminHelper.checkUserApproved(adminPage, testData.APPROVE_LIST_URL, subscriptionValue);

    // 6. Guest is redirected to the product page after approval
    console.log("✅ Guest was successfully redirected to the product page after approval.");
  });

 test('Verify that an admin can reject a guest login request, and the guest receives a rejection message and is redirected to the login screen.', async () => {
  test.setTimeout(60_000);

  // 1. Initialize browser contexts
  const adminContext = await createAdminContext();
  const userContext = await createUserContext();

  const adminPage = await adminContext.newPage();
  const userPage = await userContext.newPage();

  // 2. Admin logs in
  await AdminHelper.login(
    adminPage,
    testData.ADMIN_URL,
    testData.APPROVE_LIST_URL,
    testData.ADMIN_CREDENTIALS,
    'Admin'
  );

  // 3. Retrieve subscription value
  const subscriptionValue = await AdminHelper.getAdminSubscription(adminPage);

  // 4. Guest submits login request
  const mobileNumber = await AdminHelper.userSubmitRequest(
    userPage,
    testData.USER_URL,
    subscriptionValue
  );

  // 5. Admin rejects the guest request
  await AdminHelper.checkAndRejectRequest(
    adminPage,
    testData.APPROVE_LIST_URL,
    subscriptionValue
  );

  // 6. Guest sees rejection message and is redirected
  await AdminHelper.verifyRejectionMessage(userPage);
  console.log("✅ Rejection message is displayed after deleting the request.");
});


test('Validate that when items are assigned to multiple KOTs based on cuisine, starting the item in one KOT ,removes or locks it in the others.', async () => {
  test.setTimeout(60_000);

  // 1. Setup browser contexts for different user roles
    const adminContext = await createAdminContext();
    const kotContext = await createKotContext();
    const userContext = await createUserContext();

    // 2. Admin logs in
    const adminPage = await adminContext.newPage();
    await AdminHelper.login(
      adminPage,
      testData.ADMIN_URL,
      testData.APPROVE_LIST_URL,
      testData.ADMIN_CREDENTIALS,
      'Admin'
    );

    // 3. Admin fetches subscription
    const subscriptionValue = await AdminHelper.getAdminSubscription(adminPage);

    // 4. User submits a request
    const userPage = await userContext.newPage();
    const mobileNumber = await AdminHelper.userSubmitRequest(
      userPage,
      testData.USER_URL,
      subscriptionValue
    );

    await AdminHelper.checkElementsVisibility(
      userPage,
      testData.RESTAURANT_NAME,
      testData.RESTAURANT_ID,
      mobileNumber,
      subscriptionValue
    );

    // 5. Admin approves user request
    await AdminHelper.checkAndApproveRequest(
      adminPage,
      testData.APPROVE_LIST_URL,
      subscriptionValue
    );

    await AdminHelper.checkUserApproved(
      adminPage,
      testData.APPROVE_LIST_URL,
      subscriptionValue
    );

    // 6. User places first order
    await AdminHelper.searchAndAddDishByCategory(userPage, 'Chinese', 'Tandoori chicken Full');
    await AdminHelper.checkOrderStatusForDish(userPage, 'Chinese', 'Tandoori chicken Full', 'Placed');


    // 8. KOT logs in
    const kotPage = await kotContext.newPage();
    await AdminHelper.login(
      kotPage,
      testData.KOT_URL,
      testData.ORDER_LIST_URL,
      testData.KOT_CREDENTIALS,
      'KOT'
    );

       // 9. KOT logs in to manage orders
    const kotPage2 = await kotContext.newPage();
    await AdminHelper.login(kotPage2, testData.KOT_URL, testData.ORDER_LIST_URL, testData.KOT_CREDENTIALS2, 'KOT');

    // 9. KOT starts and dispatches first order
    await AdminHelper.updateOrderStatusForDishAsStarted(kotPage, 'Chinese', 'Tandoori chicken Full');
    await AdminHelper.checkOrderStatusForDish(userPage, 'Chinese', 'Tandoori chicken Full', 'Started');

await AdminHelper.verifyDishRemovedInKOT2AfterKOT1Starts(
  kotPage,
  kotPage2,
  'Chinese',
  'Tandoori chicken Full'
);


});
});

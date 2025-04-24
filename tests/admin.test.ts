import { test, expect, chromium } from '@playwright/test';


const guestUrl = 'http://dev.guestuser.cocaptain.co.in/#/qr-login/1amud9t235/G1';
const adminUrl = 'http://dev.kot.cocaptain.co.in/#/login/1amud9t235';


test.describe.only('Guest-Admin Approval Flow', () => {

    test.use({
        viewport: { width: 384, height: 824 },
    });

    test('Guest sends approval request', async ({ page }) => {
        const randomMobile = generateMobileNumber();
        const randomName = generateName();
        await navigate(page, guestUrl);
        await guest_login(page, randomMobile, randomName);
        test.use({
            viewport: { width: 1280, height: 720 },
        });
        await navigate(page, adminUrl);
        await login(adminpage, 'murali', 'Murali@1');


    });

    test.use({
        viewport: { width: 1280, height: 720 },
    });




});
async function guest_login(page:any, mobile, name) {
    await page.locator('#ion-input-0').fill(mobile);
    await page.locator('#ion-input-1').fill(name);
    await page.getByRole('button', { name: 'STEP-IN -Taste Awaits' }).click();
}

async function login(adminpage:any, username, password) {
    await adminpage.getByRole('textbox', { name: 'User ID' }).fill(username);
    await adminpage.getByRole('textbox', { name: 'Password' }).fill(password);
    await adminpage.getByRole('button', { name: 'Login' }).click();
}

async function navigate(page, url) {
    await page.goto(url);
}


// Utility to generate a random mobile number
function generateMobileNumber(): string {
    const start = ['6', '7', '8', '9'][Math.floor(Math.random() * 4)];
    let number = start;
    for (let i = 0; i < 9; i++) {
        number += Math.floor(Math.random() * 10).toString();
    }
    return number;
}

// Utility to generate a random name
function generateName(): string {
    const names = ['dinesh', 'manoj', 'kumar', 'arun', 'sathish', 'ravi', 'kishore'];
    return names[Math.floor(Math.random() * names.length)];
}


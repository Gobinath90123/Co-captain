// utils/loginHelper.ts

import { Page } from '@playwright/test';

export async function login(page: Page, username: string, password: string) {
  await page.goto('https://your-login-page-url.com');

  // Fill in login form
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);

  // Click login button
  await page.click('button[type="submit"]');

  // Optional: wait for navigation or some element that confirms login success
  await page.waitForURL('http://dev.restro.cocaptain.co.in/#/restaurant/restaurant-dashboard'); 
  
}

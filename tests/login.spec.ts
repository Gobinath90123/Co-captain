// tests/login.spec.ts

import { test, expect } from '@playwright/test';
import { login } from '../utils/loginHelper';

test('User can log in successfully', async ({ page }) => {
  await login(page, 'yourUsername', 'yourPassword');

  // Assert successful login
  await expect(page).toHaveURL('http://dev.restro.cocaptain.co.in/#/restaurant/restaurant-dashboard');
  
});

import { chromium, devices, Browser, BrowserContext } from '@playwright/test';

const iPhone11 = devices['iPhone 11'];
const DESKTOP_VIEWPORT = { width: 1920, height: 1080 };

export async function launchBrowser(): Promise<Browser> {
    return await chromium.launch({
      headless: false,
      args: ['--window-size=1920,1080'],
    });
  }

  export async function createAdminContext(browser: Browser): Promise<BrowserContext> {
    return await browser.newContext({ viewport: DESKTOP_VIEWPORT });
  }
  
  export async function createKotContext(browser: Browser): Promise<BrowserContext> {
    return await browser.newContext({ viewport: DESKTOP_VIEWPORT });
  }

  export async function createServerContext(browser: Browser): Promise<BrowserContext> {
    return await browser.newContext({ viewport: DESKTOP_VIEWPORT });
  }
  
  export async function createUserContext(browser: Browser): Promise<BrowserContext> {
    return await browser.newContext({ ...iPhone11 });
  }
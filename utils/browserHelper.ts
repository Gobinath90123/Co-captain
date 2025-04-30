import { chromium, devices, Browser, BrowserContext } from '@playwright/test';

const iPhone11 = devices['iPhone 11'];
const VIEWPORT = { width: 440, height: 1080 };
const SPACING = 480;

export async function launchBrowserAt(x: number): Promise<Browser> {
    return await chromium.launch({
      headless: false,
      args: [`--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
      `--window-position=${x},0`,],
    });
  }

  export async function createAdminContext(): Promise<BrowserContext> {
    const browser = await launchBrowserAt(SPACING * 0);
    return await browser.newContext({ viewport: VIEWPORT });
  }

  export async function createUserContext(): Promise<BrowserContext> {
    const browser = await launchBrowserAt(SPACING * 1);
    return await browser.newContext({ viewport: VIEWPORT });
    //return await browser.newContext({ ...iPhone11 });
  }
  
  export async function createKotContext(): Promise<BrowserContext> {
    const browser = await launchBrowserAt(SPACING * 2);
    return await browser.newContext({ viewport: VIEWPORT });
  }

  export async function createServerContext(): Promise<BrowserContext> {
    const browser = await launchBrowserAt(SPACING * 3); 
    return await browser.newContext({ viewport: VIEWPORT });
  }
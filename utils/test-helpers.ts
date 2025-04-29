import { test, expect, Page } from '@playwright/test';
import { Logger } from '../utils/logger';

function getRandomDelay(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const delay = getRandomDelay(2000, 10000);
const specifcdelay =2000;

interface LinkInfo {
  href: string | null;
  text: string | null;
  selector?: string;
  status?: number;
  isWorking?: boolean;
  error?: string;
}

// Generic test step execution with error handling and logging
export async function performTestStep<T>(
  stepDescription: string,
  action: () => Promise<T>
): Promise<T> {
  return await test.step(stepDescription, async () => {
    try {
      const result = await action();
      Logger.pass(`✅ ${stepDescription} completed successfully.`);
      return result;
    } catch (error) {
      Logger.error(`❌ ${stepDescription} failed: ${error.message}`);
      throw error;
    }
  });
}

// Generic visibility verification
export const verifyVisibility = async (element, description, timeout = 5000) => {
  await performTestStep(`Verify visibility of ${description}`, async () => {
    await expect.soft(element).toBeVisible({ timeout });
  });
};

// Generic error message verification
export async function verifyErrorMessage(element, expectedText) {
  await performTestStep(`Verify error message: ${expectedText}`, async () => {
    await expect(element).toContainText(expectedText);
  });
};

// Generic password visibility toggle


// Generic navigation verification
export async function verifyNavigation(link, page, baseURL, expectedPath, description) {
  await performTestStep(`Verify navigation to ${description}`, async () => {
    console.log(baseURL)
    await link.click();
    await page.waitForLoadState('networkidle');
    const expectedURL = `${baseURL}${expectedPath}`;
    expect(page.url()).toBe(expectedURL);
  });
}

// Generic element visibility verification
export const verifyEleVisibility = async (page, elements: string[], role: string) => {
  await performTestStep(`Verify ${role} elements visibility`, async () => {
      for (const element of elements) {
          await expect.soft(page.getByRole(role, { name: element })).toBeVisible();
      }
  });
};

// Generic text visibility verification
export const verifyTextVisibility = async (page, texts: string[]) => {
  await performTestStep('Verify text visibility', async () => {
      for (const text of texts) {
          await expect(page.getByText(text, { exact: true })).toBeVisible();
      }
  });
};

// Generic element clicking by role
export const clickElementsByRole = async (page, elements: string[], role: string) => {
  await performTestStep(`Verify ${role} elements Clicked`, async () => {
      for (const element of elements) {
          await page.getByRole(role, { name: element }).click();
      }
  });
};

// Generic text clicking
export const clickTexts = async (page, texts) => {
  await performTestStep('Verify text Clicked', async () => {
      for (const text of texts) {
          await page.getByText(text, { exact: true }).click();
      }
  });
};



export async function validatePageLinks(page: Page, options: { 
  timeout?: number, 
  logResults?: boolean 
} = {}): Promise<LinkInfo[]> {
  const { 
    timeout = 10000, 
    logResults = true 
  } = options;

  // Use page.$$eval instead of $eval to properly handle multiple elements
  const links: LinkInfo[] = await page.$$eval('a', (elements: HTMLAnchorElement[]) => 
    elements.map((el, index) => ({
      href: el.href,  // Use .href instead of getAttribute
      text: el.textContent,
      selector: `a:nth-child(${index + 1})`
    }))
  );

  const validatedLinks: LinkInfo[] = [];

  for (const link of links) {
    // Skip empty, null, or non-http links
    if (!link.href || !link.href.startsWith('http')) {
      validatedLinks.push({
        ...link,
        status: 0,
        isWorking: false,
        error: 'Invalid or empty href'
      });
      continue;
    }

    try {
      const response = await page.request.get(link.href, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      validatedLinks.push({
        ...link,
        status: response.status(),
        isWorking: response.ok()
      });
    } catch (error) {
      validatedLinks.push({
        ...link,
        status: 0,
        isWorking: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

    // Logging results if enabled
    if (logResults) {
      const workingLinks = validatedLinks.filter(link => link.isWorking);
      const brokenLinks = validatedLinks.filter(link => !link.isWorking && link.href);
      const skippedLinks = validatedLinks.filter(link => !link.href);

      console.log('\n🔍 Page Link Validation Report 🔍');
      console.log('=' .repeat(50));
      console.log(`\n📊 Total Links Found: ${validatedLinks.length}`);
      console.log(`✅ Working Links: ${workingLinks.length}`);
      console.log(`❌ Broken Links: ${brokenLinks.length}`);
      console.log(`⏩ Skipped Links: ${skippedLinks.length}`);

      // Detailed Broken Links Report
      if (brokenLinks.length > 0) {
        console.log('\n🚨 EXACT Broken Links Details:');
        brokenLinks.forEach((link, index) => {
          console.log(`🔴 Broken Link #${index + 1}:`);
          console.log(`   Text: ${link.text || 'N/A'}`);
          console.log(`   Href: ${link.href}`);
          console.log(`   Selector: ${link.selector}`);
          console.log(`   Status: ${link.status}`);
          console.log(`   Error: ${link.error}\n`);
        });
      }
    }
  return validatedLinks;
}


export async function waitForTimeout(page: Page, min:number, max:number, message?: string): Promise<void> {
  const duration = getRandomDelay(min, max); // Calculate delay *inside* the function
  const logMessage = message || `Waiting for ${duration}ms`;
  await performTestStep(logMessage, async () => {
    Logger.info(`⏳ ${logMessage}`);
    await page.waitForTimeout(duration);
  });
}
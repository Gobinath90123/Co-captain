require('dotenv').config();
export const testDir = './tests';
export const timeout = 60000;
export const retries = 0;
export const workers = process.env.CI ? 1 : 1;
export const fullyParallel = true;

export const reporter = [
  ['list'],
  [`./CustomReporterConfig.ts`],
  ['junit', { outputFile: './report/results.xml' }],
  ['monocart-reporter', {
    name: "Goperla 2.0 Automation Test Report",
    outputFile: './report/monocart-report/index.html',
  }],
];

function getBaseUrl() {
  const environment = process.env.ENV;
  switch (environment) {
    case 'qa':
      return 'http://dev.restro.cocaptain.co.in/#/restaurant/login';
    case 'dev':
      return 'http://dev.restro.cocaptain.co.in/#/restaurant/login';
    case 'stage':
      return 'http://dev.restro.cocaptain.co.in/#/restaurant/login';
    case 'local':
      return 'http://localhost';
    default:
        throw new Error(`Unknown environment: ${environment}`);
  }
}

export const use = {
  baseURL: getBaseUrl(),
  accessibilityAuditOptions: {
    rules: {
      'color-contrast': 'warning',
      'document-title': 'error',
      'landmark-one-main': 'warning'
    }
  }
};

export const projects = [
  {
    name: 'chrome',
    use: {
      browserName: `chromium`,
      channel: `chrome`,
      headless: false,
      screenshot: `on`,
      video: `on`,
      trace: `retain-on-failure`,
      actionTimeout: 120000,
      // viewport: null,
      // deviceScaleFactor: undefined,
      // launchOptions: { args: ['--start-maximized'] }
    }
  }]
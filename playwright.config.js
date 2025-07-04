// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
    use: {
        baseURL: 'https://app.slack.com/client/T08QE2DLMPX/D09154JCNUW',
        headless: false,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',

    },
    reporter: [['list'], ['allure-playwright']],
    testDir: './tests',
    timeout: 180 * 1000,
});

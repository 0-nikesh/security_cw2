import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests', // Ensure this matches your test folder
    use: {
        headless: false, // Change to true if running in CI/CD
    },
});
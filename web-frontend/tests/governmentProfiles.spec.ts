import { expect, test } from '@playwright/test';

test.describe('Government Profiles Page', () => {

    test.beforeEach(async ({ page }) => {
        // Mock the authentication token
        await page.addInitScript(() => {
            localStorage.setItem('authToken', 'test-token');
        });

        // Navigate to the Government Profiles page
        await page.goto('http://localhost:5173/government');
    });

    test('should load the page and display the title', async ({ page }) => {
        const title = page.locator('h2');
        await expect(title).toHaveText('Government Profiles');
    });


});

import { expect, test } from '@playwright/test';

test.describe('Documents Page Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Mock authentication token
        await page.addInitScript(() => {
            localStorage.setItem('authToken', 'test-token');
        });

        // Navigate to the Documents Page
        await page.goto('http://localhost:5173/documents');
    });

    // Test: Page should load and display the correct title
    test('should load the page and display the title', async ({ page }) => {
        const title = page.locator('h2');
        await expect(title).toHaveText('Detailed Guidelines'); // Adjust if needed
    });

    test('should display document cards', async ({ page }) => {
        // Debugging: Log found elements
        const documentCards = await page.locator('.shadow-lg').allTextContents();
        console.log('Documents Found:', documentCards);

        // Ensure document cards are visible
        await expect(page.locator('text=Samsung S24 Ultra').first()).toBeVisible();
        await expect(page.locator('text=NID').first()).toBeVisible();
        await expect(page.locator('text=Citizenship').first()).toBeVisible();

        // Ensure categories are visible
        await expect(page.locator('text=Phone').first()).toBeVisible();
        await expect(page.locator('text=Watch').first()).toBeVisible();
        await expect(page.locator('text=Soil').first()).toBeVisible();
    });

    // Test: Clicking on a document card navigates to details page
    test('should navigate to document details page on click', async ({ page }) => {
        // Mock API response
        await page.route('**/api/documents', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { _id: '2', name: 'NID', category: 'Watch' }
                ]),
            });
        });

        // Reload page to apply mock data
        await page.reload();

        // Click on NID card
        await page.locator('text=NID').click();

        // Expect navigation to document details page
        await expect(page).toHaveURL(/\/documents\/67b08fd43191b79cf799fd5c/);
    });

});

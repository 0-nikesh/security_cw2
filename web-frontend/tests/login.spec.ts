import { expect, test } from '@playwright/test';

test.describe('Login Page Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/login'); // Navigate to Login Page
    });

    // Test: User cannot login with empty fields
    test('User cannot login with empty fields', async ({ page }) => {
        await page.click('button:has-text("Login")'); // Click Login without entering values

        // Ensure email field remains focused (browser prevents submission)
        const emailInput = page.locator('input[id="email"]');
        await expect(emailInput).toBeFocused();

        // Ensure required attributes exist
        await expect(emailInput).toHaveAttribute('required', '');
        await expect(page.locator('input[id="password"]')).toHaveAttribute('required', '');

        // Ensure form was not submitted
        await expect(page.locator('button:has-text("Login")')).toBeVisible();
    });

    // Test: User can login successfully
    test('User can login successfully', async ({ page }) => {
        // Fill the login form
        await page.fill('input[id="email"]', 'john.doe@example.com');
        await page.fill('input[id="password"]', 'Password123');

        // Mock API response for successful login
        await page.route('**/api/users/login', async (route) => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    token: 'test-token',
                    user: { isAdmin: false },
                }),
            });
        });

        await page.click('button:has-text("Login")'); // Submit form

        // Expect redirection to user dashboard
        await page.waitForURL('http://localhost:5173/dashboard');
    });

    // Test: Admin should be redirected to the admin page after login
    test('Admin user should be redirected to admin page', async ({ page }) => {
        // Fill the login form
        await page.fill('input[id="email"]', 'admin@example.com');
        await page.fill('input[id="password"]', 'AdminPassword');

        // Mock API response for admin login
        await page.route('**/api/users/login', async (route) => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    token: 'admin-token',
                    user: { isAdmin: true },
                }),
            });
        });

        await page.click('button:has-text("Login")'); // Submit form

        // Expect redirection to admin page
        await page.waitForURL('http://localhost:5173/admin');
    });

    // Test: User cannot login with incorrect credentials
    test('User cannot login with incorrect credentials', async ({ page }) => {
        // Fill wrong credentials
        await page.fill('input[id="email"]', 'wronguser@example.com');
        await page.fill('input[id="password"]', 'wrongpassword');

        // Mock API response for incorrect credentials
        await page.route('**/api/users/login', async (route) => {
            await route.fulfill({
                status: 401,
                body: JSON.stringify({ message: 'Invalid email or password' }),
            });
        });

        await page.click('button:has-text("Login")'); // Submit form

        // Expect error toast notification to appear
        await expect(page.locator('text=Invalid email or password')).toBeVisible();
    });

    // Test: User can toggle password visibility
    test('User can toggle password visibility', async ({ page }) => {
        // Fill password field
        await page.fill('input[id="password"]', 'Password123');

        // Click on the eye icon to show the password
        await page.click('button:has-text("👁️")');

        // Check if password is now visible
        const passwordInput = page.locator('input[id="password"]');
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click again to hide password
        await page.click('button:has-text("👁️‍🗨️")');
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    // Test: User can navigate to Forgot Password page
    test('User can navigate to Forgot Password page', async ({ page }) => {
        await page.click('text=Forgot Password?'); // Click on "Forgot Password"

        // Expect navigation to forgot password page
        await expect(page).toHaveURL('http://localhost:5173/forgot-password#');
    });

    // Test: User can navigate to Register page
    test('User can navigate to Register page', async ({ page }) => {
        await page.click('text=Sign Up'); // Click on "Sign Up"

        // Expect navigation to register page
        await expect(page).toHaveURL('http://localhost:5173/register');
    });

});

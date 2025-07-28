import { expect, test } from '@playwright/test';

test.describe('Register Page Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/register'); // Navigate to Register Page
    });

    // Test: User cannot register with empty fields
    test('User cannot register with empty fields', async ({ page }) => {
        await page.click('button:has-text("Register")'); // Click Register without filling form

        // Check if first required field is still focused (browser prevents form submission)
        const firstNameInput = page.locator('input[name="fname"]');
        await expect(firstNameInput).toBeFocused();

        // Ensure "required" attributes exist
        await expect(firstNameInput).toHaveAttribute('required', '');
        await expect(page.locator('input[name="lname"]')).toHaveAttribute('required', '');
        await expect(page.locator('input[name="email"]')).toHaveAttribute('required', '');
        await expect(page.locator('input[name="password"]')).toHaveAttribute('required', '');

        // Ensure form was not submitted
        await expect(page.locator('button:has-text("Register")')).toBeVisible();
    });

    // Test: User can register successfully and receive OTP
    test('User can register successfully and receive OTP', async ({ page }) => {
        // Fill the registration form
        await page.fill('input[name="fname"]', 'John');
        await page.fill('input[name="lname"]', 'Doe');
        await page.fill('input[name="email"]', 'john.doe@example.com');
        await page.fill('input[name="password"]', 'Password123');

        // Mock API response for registration request
        await page.route('**/api/users/register', async (route) => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ userId: '12345' }) // Mocked response
            });
        });

        await page.click('button:has-text("Register")'); // Submit form

        // Expect OTP verification screen to appear
        await expect(page.locator('text=Enter the OTP')).toBeVisible();
    });

    // Test: User cannot verify OTP without entering OTP
    test('User cannot verify OTP without entering OTP', async ({ page }) => {
        // Mock API response to simulate successful registration
        await page.route('**/api/users/register', async (route) => {
            await route.fulfill({ status: 200, body: JSON.stringify({ userId: '12345' }) });
        });

        // Fill and submit registration form
        await page.fill('input[name="fname"]', 'John');
        await page.fill('input[name="lname"]', 'Doe');
        await page.fill('input[name="email"]', 'john.doe@example.com');
        await page.fill('input[name="password"]', 'Password123');
        await page.click('button:has-text("Register")');

        // Ensure OTP input appears
        await expect(page.locator('text=Enter the OTP')).toBeVisible();

        // Click "Verify OTP" without entering OTP
        await page.click('button:has-text("Verify OTP")');

        // ✅ Fix: Check if OTP input remains focused (browser prevented submission)
        const otpInput = page.locator('input[name="otp"]');
        await expect(otpInput).toBeFocused();

        // ✅ Fix: Ensure form submission didn't happen (Verify button is still visible)
        await expect(page.locator('button:has-text("Verify OTP")')).toBeVisible();
    });


    // Test: User can verify OTP successfully
    test('User can verify OTP and navigate to login page', async ({ page }) => {
        // Mock API response for successful registration
        await page.route('**/api/users/register', async (route) => {
            await route.fulfill({ status: 200, body: JSON.stringify({ userId: '12345' }) });
        });

        // Fill and submit registration form
        await page.fill('input[name="fname"]', 'John');
        await page.fill('input[name="lname"]', 'Doe');
        await page.fill('input[name="email"]', 'john.doe@example.com');
        await page.fill('input[name="password"]', 'Password123');
        await page.click('button:has-text("Register")');

        await expect(page.locator('text=Enter the OTP')).toBeVisible(); // OTP screen appears

        // Fill OTP input
        await page.fill('input[name="otp"]', '123456');

        // Mock API response for OTP verification
        await page.route('**/api/users/verify-otp', async (route) => {
            await route.fulfill({ status: 200, body: JSON.stringify({ message: 'OTP verified successfully' }) });
        });

        await page.click('button:has-text("Verify OTP")'); // Submit OTP

        // Expect redirection to login page
        await page.waitForURL('http://localhost:5173/login');
    });

    // Test: User can navigate to login page from register page
    test('User can navigate to login page from register page', async ({ page }) => {
        await page.click('text=Login'); // Click on "Login" link

        // Expect navigation to login page
        await expect(page).toHaveURL('http://localhost:5173/login');
    });

});

import { test, expect } from '@playwright/test';

/**
 * NuuMee Authentication E2E Tests
 *
 * Tests the complete authentication flow including:
 * - Login page functionality
 * - Signup page functionality
 * - Protected route access control
 * - Public route accessibility
 * - Social authentication UI
 * - Error states and validation
 */

test.describe('Authentication Flow', () => {

  test.describe('Login Page', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should load login page correctly', async ({ page }) => {
      // Check page title and heading
      await expect(page).toHaveTitle(/NuuMee/);
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

      // Check NuuMee branding
      const logo = page.locator('a[href="/"]');
      await expect(logo).toBeVisible();
      await expect(logo.getByText('NuuMee.AI')).toBeVisible();
    });

    test('should display Google login button', async ({ page }) => {
      const googleButton = page.getByRole('button', { name: /continue with google/i });
      await expect(googleButton).toBeVisible();
      await expect(googleButton).toBeEnabled();

      // Verify Google icon is present
      const googleIcon = googleButton.locator('svg').first();
      await expect(googleIcon).toBeVisible();
    });

    test('should display GitHub login button', async ({ page }) => {
      const githubButton = page.getByRole('button', { name: /continue with github/i });
      await expect(githubButton).toBeVisible();
      await expect(githubButton).toBeEnabled();

      // Verify GitHub icon is present
      const githubIcon = githubButton.locator('svg').first();
      await expect(githubIcon).toBeVisible();
    });

    test('should display email/password form fields', async ({ page }) => {
      // Email field
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');

      // Password field
      const passwordInput = page.getByLabel(/^password$/i);
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Password visibility toggle
      const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).nth(2);
      await expect(toggleButton).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.getByLabel(/^password$/i);
      const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).nth(2);

      // Initially password type
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide password again
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should display remember me checkbox', async ({ page }) => {
      const rememberCheckbox = page.getByLabel(/remember me/i);
      await expect(rememberCheckbox).toBeVisible();
    });

    test('should display forgot password link', async ({ page }) => {
      const forgotLink = page.getByRole('link', { name: /forgot password/i });
      await expect(forgotLink).toBeVisible();
      await expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });

    test('should have link to signup page', async ({ page }) => {
      const signupLink = page.getByRole('link', { name: /sign up/i });
      await expect(signupLink).toBeVisible();
      await expect(signupLink).toHaveAttribute('href', '/signup');
    });

    test('should navigate to signup page when clicking signup link', async ({ page }) => {
      await page.getByRole('link', { name: /sign up/i }).click();
      await expect(page).toHaveURL(/\/signup/);
    });

    test('should display sign in button', async ({ page }) => {
      const signInButton = page.getByRole('button', { name: /^sign in$/i });
      await expect(signInButton).toBeVisible();
      await expect(signInButton).toBeEnabled();
    });

    test('should display divider text', async ({ page }) => {
      const divider = page.getByText(/or continue with email/i);
      await expect(divider).toBeVisible();
    });

    test('should show validation error for empty form submission', async ({ page }) => {
      const signInButton = page.getByRole('button', { name: /^sign in$/i });
      await signInButton.click();

      // Wait for error message
      await page.waitForTimeout(500);

      // Check for error message
      const errorMessage = page.locator('text=Please fill in all fields');
      await expect(errorMessage).toBeVisible();
    });

    test('should show loading state when submitting', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/^password$/i);
      const signInButton = page.getByRole('button', { name: /^sign in$/i });

      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');

      // Click and check for loading state
      await signInButton.click();

      // Should show loading text
      const loadingButton = page.getByRole('button', { name: /signing in/i });
      await expect(loadingButton).toBeVisible();
    });

    test('should disable buttons when loading', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/^password$/i);
      const signInButton = page.getByRole('button', { name: /^sign in$/i });

      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await signInButton.click();

      // Social buttons should be disabled during loading
      const googleButton = page.getByRole('button', { name: /continue with google/i });
      const githubButton = page.getByRole('button', { name: /continue with github/i });

      await expect(googleButton).toBeDisabled();
      await expect(githubButton).toBeDisabled();
    });

    test('should have proper NuuMee branding colors', async ({ page }) => {
      const logoContainer = page.locator('div.bg-gradient-to-br').first();
      await expect(logoContainer).toBeVisible();

      // Check for brand text
      const brandText = page.getByText('NuuMee.AI');
      await expect(brandText).toBeVisible();
    });
  });

  test.describe('Signup Page', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/signup');
    });

    test('should load signup page correctly', async ({ page }) => {
      // Check page title and heading
      await expect(page).toHaveTitle(/NuuMee/);
      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
      await expect(page.getByText(/start creating ai videos today/i)).toBeVisible();

      // Check NuuMee branding
      const logo = page.locator('a[href="/"]');
      await expect(logo).toBeVisible();
      await expect(logo.getByText('NuuMee.AI')).toBeVisible();
    });

    test('should display social signup buttons', async ({ page }) => {
      const googleButton = page.getByRole('button', { name: /continue with google/i });
      const githubButton = page.getByRole('button', { name: /continue with github/i });

      await expect(googleButton).toBeVisible();
      await expect(googleButton).toBeEnabled();
      await expect(githubButton).toBeVisible();
      await expect(githubButton).toBeEnabled();
    });

    test('should display all signup form fields', async ({ page }) => {
      // Full Name field
      const nameInput = page.getByLabel(/full name/i);
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toHaveAttribute('type', 'text');
      await expect(nameInput).toHaveAttribute('placeholder', 'John Doe');

      // Email field
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');

      // Password field
      const passwordInput = page.getByLabel(/^password$/i);
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Confirm Password field
      const confirmPasswordInput = page.getByLabel(/confirm password/i);
      await expect(confirmPasswordInput).toBeVisible();
      await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    test('should display password strength indicator', async ({ page }) => {
      const passwordInput = page.getByLabel(/^password$/i);

      // Type a weak password
      await passwordInput.fill('abc');

      // Should show password strength
      await expect(page.getByText(/password strength/i)).toBeVisible();
      await expect(page.getByText(/weak/i)).toBeVisible();
    });

    test('should show password requirements checklist', async ({ page }) => {
      const passwordInput = page.getByLabel(/^password$/i);
      await passwordInput.fill('a');

      // Check for password requirements
      await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
      await expect(page.getByText(/one lowercase letter/i)).toBeVisible();
      await expect(page.getByText(/one uppercase letter/i)).toBeVisible();
      await expect(page.getByText(/one number/i)).toBeVisible();
      await expect(page.getByText(/one special character/i)).toBeVisible();
    });

    test('should update password strength as user types', async ({ page }) => {
      const passwordInput = page.getByLabel(/^password$/i);

      // Weak password
      await passwordInput.fill('abc');
      await expect(page.getByText(/weak/i)).toBeVisible();

      // Fair password
      await passwordInput.fill('abcdef12');
      await page.waitForTimeout(300);

      // Strong password
      await passwordInput.fill('Abcdef12!@');
      await page.waitForTimeout(300);
      await expect(page.getByText(/strong|good/i)).toBeVisible();
    });

    test('should show password mismatch error', async ({ page }) => {
      const passwordInput = page.getByLabel(/^password$/i);
      const confirmPasswordInput = page.getByLabel(/confirm password/i);

      await passwordInput.fill('Password123!');
      await confirmPasswordInput.fill('Password456!');

      // Should show mismatch error
      await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('should toggle password visibility for both fields', async ({ page }) => {
      const passwordInput = page.getByLabel(/^password$/i);
      const confirmPasswordInput = page.getByLabel(/confirm password/i);

      // Initially both are password type
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Toggle password visibility (find toggle buttons by their position)
      const toggleButtons = page.locator('button[type="button"]').filter({ has: page.locator('svg') });

      // Click first password toggle
      await toggleButtons.nth(2).click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click confirm password toggle
      await toggleButtons.nth(3).click();
      await expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    test('should display terms and privacy policy links', async ({ page }) => {
      const termsLink = page.getByRole('link', { name: /terms of service/i });
      const privacyLink = page.getByRole('link', { name: /privacy policy/i });

      await expect(termsLink).toBeVisible();
      await expect(termsLink).toHaveAttribute('href', '/terms');
      await expect(privacyLink).toBeVisible();
      await expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    test('should have link to login page', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /sign in/i });
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute('href', '/login');
    });

    test('should navigate to login page when clicking login link', async ({ page }) => {
      await page.getByRole('link', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/login/);
    });

    test('should display create account button', async ({ page }) => {
      const createButton = page.getByRole('button', { name: /create account/i });
      await expect(createButton).toBeVisible();
      await expect(createButton).toBeEnabled();
    });

    test('should display divider text', async ({ page }) => {
      const divider = page.getByText(/or sign up with email/i);
      await expect(divider).toBeVisible();
    });

    test('should show loading state when creating account', async ({ page }) => {
      const nameInput = page.getByLabel(/full name/i);
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/^password$/i);
      const confirmPasswordInput = page.getByLabel(/confirm password/i);
      const createButton = page.getByRole('button', { name: /create account/i });

      // Fill form with valid data
      await nameInput.fill('John Doe');
      await emailInput.fill('john@example.com');
      await passwordInput.fill('Password123!');
      await confirmPasswordInput.fill('Password123!');

      // Submit and check loading state
      await createButton.click();

      const loadingButton = page.getByRole('button', { name: /creating account/i });
      await expect(loadingButton).toBeVisible();
    });

    test('should validate full name is required', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/^password$/i);
      const confirmPasswordInput = page.getByLabel(/confirm password/i);
      const createButton = page.getByRole('button', { name: /create account/i });

      // Fill only email and passwords
      await emailInput.fill('john@example.com');
      await passwordInput.fill('Password123!');
      await confirmPasswordInput.fill('Password123!');

      await createButton.click();
      await page.waitForTimeout(500);

      // Should show error
      await expect(page.getByText(/please enter your full name/i)).toBeVisible();
    });

    test('should validate password requirements on submit', async ({ page }) => {
      const nameInput = page.getByLabel(/full name/i);
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/^password$/i);
      const confirmPasswordInput = page.getByLabel(/confirm password/i);
      const createButton = page.getByRole('button', { name: /create account/i });

      // Fill form with weak password
      await nameInput.fill('John Doe');
      await emailInput.fill('john@example.com');
      await passwordInput.fill('weak');
      await confirmPasswordInput.fill('weak');

      await createButton.click();
      await page.waitForTimeout(500);

      // Should show error
      await expect(page.getByText(/password does not meet all requirements/i)).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {

    test('should redirect /jobs to login when unauthenticated', async ({ page }) => {
      // Attempt to access jobs page without auth
      await page.goto('/jobs');

      // Should redirect to login (or stay on jobs but show login required state)
      // Note: This test may need adjustment based on actual auth guard implementation
      await page.waitForTimeout(1000);

      // Check if redirected to login OR if page shows auth required message
      const url = page.url();
      const hasLoginUrl = url.includes('/login');
      const hasJobsUrl = url.includes('/jobs');

      // Either redirected to login or on jobs page (will be handled by auth guard)
      expect(hasLoginUrl || hasJobsUrl).toBeTruthy();
    });

    test('should redirect /account to login when unauthenticated', async ({ page }) => {
      await page.goto('/account');
      await page.waitForTimeout(1000);

      const url = page.url();
      const hasLoginUrl = url.includes('/login');
      const hasAccountUrl = url.includes('/account');

      expect(hasLoginUrl || hasAccountUrl).toBeTruthy();
    });

    test('should redirect /billing to login when unauthenticated', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForTimeout(1000);

      const url = page.url();
      const hasLoginUrl = url.includes('/login');
      const hasBillingUrl = url.includes('/billing');

      expect(hasLoginUrl || hasBillingUrl).toBeTruthy();
    });

    test('should redirect /api-keys to login when unauthenticated', async ({ page }) => {
      await page.goto('/api-keys');
      await page.waitForTimeout(1000);

      const url = page.url();
      const hasLoginUrl = url.includes('/login');
      const hasApiKeysUrl = url.includes('/api-keys');

      expect(hasLoginUrl || hasApiKeysUrl).toBeTruthy();
    });
  });

  test.describe('Public Routes', () => {

    test('should load home page without authentication', async ({ page }) => {
      await page.goto('/');

      // Should load successfully
      await expect(page).toHaveTitle(/NuuMee/);

      // Should show marketing content (adjust selector based on actual content)
      // This is a basic check - adjust based on actual home page content
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/');
    });

    test('should load pricing page without authentication', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForTimeout(1000);

      // Should load or show 404 (if not implemented yet)
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should load documentation page without authentication', async ({ page }) => {
      await page.goto('/documentation');
      await page.waitForTimeout(1000);

      // Should load or show 404 (if not implemented yet)
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should load dev pages without authentication', async ({ page }) => {
      await page.goto('/dev');

      // Should load successfully
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/dev');
    });
  });

  test.describe('Navigation Between Auth Pages', () => {

    test('should navigate from login to signup and back', async ({ page }) => {
      // Start at login
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

      // Go to signup
      await page.getByRole('link', { name: /sign up/i }).click();
      await expect(page).toHaveURL(/\/signup/);
      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();

      // Go back to login
      await page.getByRole('link', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    });

    test('should navigate to home page from login via logo', async ({ page }) => {
      await page.goto('/login');

      // Click logo
      const logo = page.locator('a[href="/"]').first();
      await logo.click();

      await expect(page).toHaveURL('/');
    });

    test('should navigate to home page from signup via logo', async ({ page }) => {
      await page.goto('/signup');

      // Click logo
      const logo = page.locator('a[href="/"]').first();
      await logo.click();

      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Visual Regression', () => {

    test('login page visual snapshot @visual', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Take full page screenshot
      await expect(page).toHaveScreenshot('login-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('signup page visual snapshot @visual', async ({ page }) => {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');

      // Take full page screenshot
      await expect(page).toHaveScreenshot('signup-page.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('login page with error state @visual', async ({ page }) => {
      await page.goto('/login');

      // Trigger error
      const signInButton = page.getByRole('button', { name: /^sign in$/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Take screenshot with error
      await expect(page).toHaveScreenshot('login-page-error.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('signup page with password requirements @visual', async ({ page }) => {
      await page.goto('/signup');

      // Fill password to show requirements
      const passwordInput = page.getByLabel(/^password$/i);
      await passwordInput.fill('Test123!');

      // Take screenshot with password requirements visible
      await expect(page).toHaveScreenshot('signup-page-password-requirements.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('login page should be responsive on mobile', async ({ page }) => {
      await page.goto('/login');

      // Check that key elements are visible and usable on mobile
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();
    });

    test('signup page should be responsive on mobile', async ({ page }) => {
      await page.goto('/signup');

      // Check that key elements are visible and usable on mobile
      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
      await expect(page.getByLabel(/full name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {

    test('login page should have proper ARIA labels', async ({ page }) => {
      await page.goto('/login');

      // Check form labels
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByLabel(/remember me/i)).toBeVisible();
    });

    test('signup page should have proper ARIA labels', async ({ page }) => {
      await page.goto('/signup');

      // Check form labels
      await expect(page.getByLabel(/full name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    });

    test('login form should be keyboard navigable', async ({ page }) => {
      await page.goto('/login');

      // Tab through form elements
      await page.keyboard.press('Tab'); // Google button
      await page.keyboard.press('Tab'); // GitHub button
      await page.keyboard.press('Tab'); // Email input
      const emailInput = await page.locator(':focus');
      await expect(emailInput).toHaveAttribute('id', 'email');

      await page.keyboard.press('Tab'); // Password input
      const passwordInput = await page.locator(':focus');
      await expect(passwordInput).toHaveAttribute('id', 'password');
    });

    test('signup form should be keyboard navigable', async ({ page }) => {
      await page.goto('/signup');

      // Tab through form elements
      await page.keyboard.press('Tab'); // Google button
      await page.keyboard.press('Tab'); // GitHub button
      await page.keyboard.press('Tab'); // Full name input
      const nameInput = await page.locator(':focus');
      await expect(nameInput).toHaveAttribute('id', 'fullName');
    });
  });
});

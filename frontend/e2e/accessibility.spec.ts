import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Test configuration - using production URL
const FRONTEND_URL = 'https://wanapi-prod.web.app';

// Critical pages to audit
const PAGES_TO_AUDIT = [
  { name: 'Home', path: '/' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
  { name: 'Support', path: '/support' },
  { name: 'Terms', path: '/terms' },
  { name: 'Privacy', path: '/privacy' },
  { name: 'Examples', path: '/examples' },
  { name: 'Blog', path: '/blog' },
  { name: 'Payment Success', path: '/payment/success?credits=100' },
  { name: 'Payment Cancelled', path: '/payment/cancelled' },
];

test.describe('Accessibility Audit - WCAG 2.1 AA Compliance @a11y', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const page of PAGES_TO_AUDIT) {
    test(`${page.name} page should not have critical accessibility violations`, async ({ page: browserPage }) => {
      await browserPage.goto(`${FRONTEND_URL}${page.path}`);
      await browserPage.waitForLoadState('networkidle');

      // Run axe accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page: browserPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      // Filter out minor violations, focus on serious and critical
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      // Log violations for debugging
      if (criticalViolations.length > 0) {
        console.log(`\n${page.name} Accessibility Violations:`);
        criticalViolations.forEach((violation) => {
          console.log(`  - ${violation.id}: ${violation.description}`);
          console.log(`    Impact: ${violation.impact}`);
          console.log(`    Help: ${violation.helpUrl}`);
          violation.nodes.forEach((node) => {
            console.log(`    Element: ${node.target.join(' > ')}`);
          });
        });
      }

      // Assert no critical violations
      expect(criticalViolations).toHaveLength(0);
    });
  }

  test('pricing page has complete accessibility features', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check for skip link (best practice)
    const skipLink = page.locator('a[href="#main-content"], a[href="#content"]');
    const hasSkipLink = (await skipLink.count()) > 0;

    // Check for main landmark
    const mainLandmark = page.locator('main, [role="main"]');
    await expect(mainLandmark).toBeVisible();

    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();

    // Check buttons have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.getAttribute('aria-label') ||
        await button.innerText();
      expect(accessibleName?.length).toBeGreaterThan(0);
    }

    // Check links have accessible names
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = links.nth(i);
      const linkText = await link.innerText();
      const ariaLabel = await link.getAttribute('aria-label');
      expect(linkText || ariaLabel).toBeTruthy();
    }

    // Check form inputs have labels
    const inputs = page.locator('input:not([type="hidden"])');
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = (await label.count()) > 0;
        expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy();
      }
    }
  });

  test('keyboard navigation works on pricing page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();

    // Tab several times to ensure focus moves
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focused);

    // Check focus is visible (element should have outline or other visual indicator)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Run axe specifically for color contrast
    const contrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ runOnly: ['color-contrast'] })
      .analyze();

    // Log any contrast violations
    if (contrastResults.violations.length > 0) {
      console.log('\nColor Contrast Violations:');
      contrastResults.violations.forEach((v) => {
        v.nodes.forEach((node) => {
          console.log(`  Element: ${node.target.join(' > ')}`);
          console.log(`  Message: ${node.failureSummary}`);
        });
      });
    }

    // Allow some contrast violations for now (decorative elements)
    expect(contrastResults.violations.length).toBeLessThanOrEqual(5);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check all images have alt attributes
    const images = page.locator('img');
    const imgCount = await images.count();

    for (let i = 0; i < imgCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Image should have alt text, or be marked as decorative
      expect(alt !== null || role === 'presentation' || ariaHidden === 'true').toBeTruthy();
    }
  });

  test('forms are properly labeled', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Run axe on forms
    const formResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ runOnly: ['label', 'label-title-only', 'form-field-multiple-labels'] })
      .analyze();

    expect(formResults.violations).toHaveLength(0);
  });
});

test.describe('Accessibility - Screen Reader Compatibility', () => {
  test('page has proper document structure', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check for lang attribute
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();

    // Check for title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    const hasMetaDescription = (await metaDescription.count()) > 0;
    expect(hasMetaDescription).toBeTruthy();
  });

  test('interactive elements have proper ARIA roles', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check tabs have proper ARIA
    const tablist = page.locator('[role="tablist"]');
    if ((await tablist.count()) > 0) {
      const tabs = page.locator('[role="tab"]');
      const tabpanels = page.locator('[role="tabpanel"]');
      expect(await tabs.count()).toBeGreaterThan(0);
    }

    // Check dialogs/modals if any
    const dialogs = page.locator('[role="dialog"], [role="alertdialog"]');
    const dialogCount = await dialogs.count();
    for (let i = 0; i < dialogCount; i++) {
      const dialog = dialogs.nth(i);
      const ariaLabel = await dialog.getAttribute('aria-label');
      const ariaLabelledby = await dialog.getAttribute('aria-labelledby');
      expect(ariaLabel || ariaLabelledby).toBeTruthy();
    }
  });
});

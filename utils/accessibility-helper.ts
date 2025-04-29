import { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

export async function runAccessibilityCheck(page: Page, options: { focusOnColorContrast?: boolean } = {}) {
 
    const builder = new AxeBuilder({ page })
        .withRules([
            'color-contrast',
            'document-title',
            'landmark-one-main',
            'page-has-heading-one'
        ]);
    const { violations } = await builder.analyze();

    // Optional: Filter only color contrast if specified
    const filteredViolations = options.focusOnColorContrast 
        ? violations.filter(v => v.id === 'color-contrast')
        : violations;

    // Log detailed violations for debugging
    filteredViolations.forEach(violation => {
        console.log(`Accessibility Violation: ${violation.description}`);
        console.log(`Impact: ${violation.impact}`);
        console.log(`Help: ${violation.help}`);
        console.log('Nodes:', violation.nodes.map(node => node.html));
        console.log('---');
    });

    return filteredViolations;
}

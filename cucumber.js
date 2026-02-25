export default {
  default: {
    paths: ['playwright/features/**/*.feature'],
    import: ['playwright/step-definitions/**/*.ts', 'playwright/support/**/*.ts'],
    format: ['progress'],
    publishQuiet: true
  }
};

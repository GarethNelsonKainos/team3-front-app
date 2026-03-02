import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from '@playwright/test';

export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
}

setWorldConstructor(CustomWorld);

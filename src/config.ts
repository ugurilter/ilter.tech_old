// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Ugur Ilter - Personal Website";
export const SITE_DESCRIPTION =
  "Welcome to my personal website !";
export const TWITTER_HANDLE = "@";
export const MY_NAME = "Ugur Ilter";

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;

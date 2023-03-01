/**
 * Global constants
 */
export const SITE_TITLE       = "Ugur Ilter - Personal Website";
export const SITE_DESCRIPTION = "Welcome to my personal website !";
export const MY_NAME          = "Ugur Ilter";
export const MY_TITLE         = "Sr. Embedded Software Engineer";

/**
 * Social handles & urls
 */
export const SOC_LINKEDIN_HDL = "ugurilter"
export const SOC_LINKEDIN_URL = "https://www.linkedin.com/in/ugurilter/"
export const SOC_STEAM_HDL    = ""
export const SOC_STEAM_URL    = ""
export const SOC_GITHUB_HDL   = "ugurilter"
export const SOC_GITHUB_URL   = "https://www.github.com/ugurilter"
export const SOC_SO_HDL       = "ugurilter"
export const SOC_SO_URL       = "https://stackoverflow.com/users/8676955/ugur-ilter"


// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;

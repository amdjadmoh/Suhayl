/**
 * Chrome Web Store and Edge Add-ons IDs for the WannaOut extension.
 *
 * Until the extension is published, these are placeholders. The CTA will
 * fall back to the "install instructions" link if the IDs are not set.
 *
 * After publishing:
 *   - Chrome Web Store ID is in the URL of your store listing
 *     (https://chromewebstore.google.com/detail/wannabout/<THIS_PART>)
 *   - Edge Add-ons ID is in the URL of your Edge listing
 *     (https://microsoftedge.microsoft.com/addons/detail/wannabout/<THIS_PART>)
 */
export const STORE_IDS = {
  chrome: '',  // TODO: set after publishing
  edge: '',    // TODO: set after publishing
} as const;

/** URL of the install-instructions page (e.g. a docs page or the extension README). */
export const INSTALL_INSTRUCTIONS_URL =
  'https://github.com/<owner>/wannabout/blob/master/extension/README.md';

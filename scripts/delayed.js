// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

import { sendAnalyticsPageLoadedEvent } from './adobeDataLayer.js';
import { addScript, GLOBAL_EVENTS, instance } from './utils.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

sendAnalyticsPageLoadedEvent();

addScript('https://consent.cookiebot.com/uc.js', { culture: 'en', cbid: '4a55b566-7010-4633-9b03-7ba7735be0b6' }, 'defer');

addScript(instance === 'prod'
  ? 'https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-b1f76be4d2ee.min.js'
  : 'https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-3e7065dd10db-staging.min.js', {}, 'defer', () => {
  document.dispatchEvent(new Event(GLOBAL_EVENTS.ADOBE_MC_LOADED));
});

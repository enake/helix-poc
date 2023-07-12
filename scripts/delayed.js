// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

import { sendAnalyticsPageLoadedEvent, getParamValue } from './adobeDataLayer.js';
import { addScript, instance } from './utils.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

sendAnalyticsPageLoadedEvent();

addScript('https://consent.cookiebot.com/uc.js', { culture: 'en', cbid: '4a55b566-7010-4633-9b03-7ba7735be0b6' }, 'async');

if (getParamValue('t') !== '1') {
  if (instance === 'prod') addScript('https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-b1f76be4d2ee.min.js', {}, 'async');
  else addScript('https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-3e7065dd10db-staging.min.js', {}, 'async');

  addScript('https://www.googletagmanager.com/gtm.js?id=GTM-PLJJB3', {}, 'async');
}

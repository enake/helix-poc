// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

import { sendAnalyticsPageLoadedEvent } from './adobeDataLayer.js';
import { addScript, instance } from './utils.js';
import initZuoraNL from './zuora.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
const isZuoraNL = window.DEFAULT_LANGUAGE === 'nl';

if (isZuoraNL) {
  // for NL - Zuora
  window.config = initZuoraNL.config();
  addScript('https://checkout.bitdefender.com/static/js/sdk.js', {}, 'defer', () => {
    console.log('initZuoraNL');
    // if (productsList.length) {
    //   productsList.forEach(async (item) => {
    //     const zuoraResult = await initZuoraNL.loadProduct(item);
    //     showPrices(zuoraResult);
    //   });
    // }
  });
}

sendAnalyticsPageLoadedEvent();

addScript('https://consent.cookiebot.com/uc.js', { culture: 'en', cbid: '4a55b566-7010-4633-9b03-7ba7735be0b6' }, 'defer');

if (instance === 'prod') addScript('https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-b1f76be4d2ee.min.js', {}, 'defer');
else addScript('https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-3e7065dd10db-staging.min.js', {}, 'defer');

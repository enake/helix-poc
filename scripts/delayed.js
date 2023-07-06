// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

import { sendAnalyticsPageLoadedEvent } from './adobeDataLayer.js';
import { addInlineScript, addScript, instance } from './utils.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

sendAnalyticsPageLoadedEvent();

addInlineScript(`
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PLJJB3');
`);

if (instance === 'prod') addScript('https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-b1f76be4d2ee.min.js', {}, 'async', 'head');
else addScript('https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-3e7065dd10db-staging.min.js', {}, 'async', 'head');

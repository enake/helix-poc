/**
 * Returns the instance name based on the hostname
 * @returns {String}
 */
export const instance = (() => {
  const hostToInstance = {
    'pages.bitdefender.com': 'prod',
    'hlx.page': 'stage',
    'hlx.live': 'stage',
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const [host, inst] of Object.entries(hostToInstance)) {
    if (window.location.hostname.includes(host)) return inst;
  }

  return 'dev';
})();

/**
 * Returns the geoIP country code. Very costly on performance, use with caution.
 * @returns {String}
 */

/**
let cachedIpCountry;
export const getIpCountry = async () => {
  if (cachedIpCountry) {
    return cachedIpCountry;
  }

  try {
    const response = await fetch('https://pages.bitdefender.com/ip.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const ipCountry = response.headers.get('X-Cf-Ipcountry').toLowerCase();

      if (ipCountry) {
        cachedIpCountry = ipCountry;
        return ipCountry;
      }
      throw new Error('X-Cf-Ipcountry header not found');
    }
  } catch (error) {
    console.log(`There has been a problem with your fetch operation: ${error.message}`);
    return null;
  }
};
*/

// add new script file
export const addScript = (src, data = {}, type = undefined, callback = undefined) => {
  const s = document.createElement('script');

  s.setAttribute('src', src);

  if (type) {
    s.setAttribute(type, true);
  }

  if (typeof data === 'object' && data !== null) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in data) {
      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty(key)) {
        s.dataset[key] = data[key];
      }
    }
  }

  if (callback) {
    s.addEventListener('load', () => {
      callback();
    });
  }

  document.body.appendChild(s);
};

export function getDefaultLanguage() {
  return window.location.pathname.split('/')[2];
}

export const GLOBAL_EVENTS = {
  ADOBE_MC_LOADED: 'adobe_mc::loaded',
};

export function adobeMcAppendVisitorId(selector) {
  // https://experienceleague.adobe.com/docs/id-service/using/id-service-api/methods/appendvisitorid.html?lang=en
  try {
    const adbeDomains = ['bitdefender.com'];
    const visitor = Visitor.getInstance('0E920C0F53DA9E9B0A490D45@AdobeOrg', {
      trackingServer: 'sstats.adobe.com',
      trackingServerSecure: 'sstats.adobe.com',
      marketingCloudServer: 'sstats.adobe.com',
      marketingCloudServerSecure: 'sstats.adobe.com',
    });
    const wrapperSelector = document.querySelector(selector);
    adbeDomains.forEach((domain) => {
      const domainRegex = RegExp(domain);
      if (!domainRegex.test(window.location.hostname)) {
        const hrefSelector = `[href*="${domain}"]`;
        wrapperSelector.querySelectorAll(hrefSelector).forEach((href) => {
          href.addEventListener('mousedown', (event) => {
            const destinationURLWithVisitorIDs = visitor.appendVisitorIDsTo(event.currentTarget.href);
            event.currentTarget.href = destinationURLWithVisitorIDs.replace(/MCAID%3D.*%7CMCORGID/, 'MCAID%3D%7CMCORGID');
          });
        });
      }
    });
  } catch (e) {
    console.error('Failed to load https://assets.adobedtm.com script, Visitor will not be defined');
  }
}

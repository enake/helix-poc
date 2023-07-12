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
    const visitor = Visitor.getInstance('0E920C0F53DA9E9B0A490D45@AdobeOrg', {
      trackingServer: 'sstats.adobe.com',
      trackingServerSecure: 'sstats.adobe.com',
      marketingCloudServer: 'sstats.adobe.com',
      marketingCloudServerSecure: 'sstats.adobe.com',
    });
    const wrapperSelector = document.querySelector(selector);
    const hrefSelector = '[href*="bitdefender"]';
    wrapperSelector.querySelectorAll(hrefSelector).forEach((href) => {
      href.addEventListener('mousedown', (event) => {
        const destinationURLWithVisitorIDs = visitor.appendVisitorIDsTo(event.currentTarget.href);
        event.currentTarget.href = destinationURLWithVisitorIDs.replace(/MCAID%3D.*%7CMCORGID/, 'MCAID%3D%7CMCORGID');
      });
    });
  } catch (e) {
    console.error('Failed to load https://assets.adobedtm.com script, Visitor will not be defined');
  }
}

export const productsList = [];

export const updateProductsList = (product) => {
  const productTrim = product.trim();
  if (productsList.indexOf(productTrim) === -1) {
    productsList.push(productTrim);
  }
};

// truncatePrice
const truncatePrice = (price) => {
  let ret = price;
  try {
    if (ret >= 0) {
      ret = Math.floor(ret);
    } else {
      ret = Math.ceil(ret);
    }

    if (price !== ret) {
      ret = price;
    }
  } catch (e) { console.log(e); }

  return ret;
};

// formatPrice
const formatPrice = (priceVal, currency, region) => {
  const price = truncatePrice(priceVal);
  const currencyPrice = [3, 4, 8, 2, 11, 12, 16];

  if (currencyPrice.includes(region)) {
    return `${currency} ${price}`;
  }

  return `${price} ${currency}`;
};

export function isZuoraForNetherlandsLangMode() {
  return getDefaultLanguage() === 'nl';
}

// get max discount
const maxDiscount = () => {
  const discountAmounts = [];
  if (document.querySelector('.percent')) {
    document.querySelectorAll('.percent').forEach((item) => {
      const discountAmount = parseInt(item.textContent, 10);
      if (!Number.isNaN(discountAmount)) {
        discountAmounts.push(discountAmount);
      }
    });
  }

  const maxDiscountValue = Math.max(...discountAmounts).toString();
  if (document.querySelector('.max-discount')) {
    document.querySelectorAll('.max-discount').forEach((item) => {
      item.textContent = `${maxDiscountValue}%`;
    });
  }
};

// display prices
export function showPrices(storeObj, triggerVPN = false, checkboxId = '') {
  const { currency_label: currencyLabel } = storeObj.selected_variation;
  const { region_id: regionId } = storeObj.selected_variation;
  const { product_id: productId } = storeObj.config;

  let parentDiv = '';
  let buyLink = storeObj.buy_link;
  let selectedVarPrice = storeObj.selected_variation.price;

  // todo: extract query selector just to used once for perf reasons
  if (document.querySelector(`.show_vpn_${productId}`)) {
    document.querySelector(`.show_vpn_${productId}`).style.display = 'none';
  }

  const storeObjVPN = window.StoreProducts.product.vpn || {};
  // todo storeObjVPN will always be truthy, so this if condition expression will always evaluate to true; fix this line: const storeObjVPN = window.StoreProducts.product.vpn || {};
  if (triggerVPN && storeObjVPN) {
    parentDiv = document.getElementById(checkboxId).closest('div.prod_box');
    buyLink += '&bundle_id=com.bitdefender.vpn&bundle_payment_period=1d1y';
    selectedVarPrice += storeObjVPN.selected_variation.price || 0;
    selectedVarPrice = selectedVarPrice.toFixed(2);

    // todo: extract query selector just to used once for perf reasons
    if (document.querySelector(`.show_vpn_${productId}`)) {
      document.querySelector(`.show_vpn_${productId}`).style.display = 'block';
    }
  }

  // if it has discount
  // todo we shouldn't check if a variable is a specific type, because we must know in advance what is the shape of it; in advance you should know if storeObj.selected_variation.discount is an object / string / number / boolean / etc
  // todo adapt the if() condition from bellow
  if (typeof storeObj.selected_variation.discount === 'object') {
    let selectedVarDiscount = storeObj.selected_variation.discount.discounted_price;
    if (triggerVPN && storeObjVPN) {
      selectedVarDiscount += storeObjVPN.selected_variation.discount.discounted_price || 0;
    }

    const fullPrice = formatPrice(selectedVarPrice, currencyLabel, regionId);
    const offerPrice = formatPrice(selectedVarDiscount, currencyLabel, regionId);
    const savingsPrice = selectedVarPrice - selectedVarDiscount;
    const savings = formatPrice(savingsPrice.toFixed(0), currencyLabel, regionId);
    const percentageSticker = (((selectedVarPrice - selectedVarDiscount) / selectedVarPrice) * 100).toFixed(0);

    if (document.querySelector(`.oldprice-${productId}`)) {
      if (triggerVPN) {
        parentDiv.querySelector(`.oldprice-${productId}`).innerHTML = fullPrice;
      } else {
        document.querySelectorAll(`.oldprice-${productId}`).forEach((item) => {
          item.innerHTML = fullPrice;
        });
      }
    }

    if (document.querySelector(`.newprice-${productId}`)) {
      if (triggerVPN) {
        parentDiv.querySelector(`.newprice-${productId}`).innerHTML = offerPrice;
      } else {
        document.querySelectorAll(`.newprice-${productId}`).forEach((item) => {
          item.innerHTML = offerPrice;
        });
      }
    }

    if (document.querySelector(`.save-${productId}`)) {
      if (triggerVPN) {
        parentDiv.querySelector(`.save-${productId}`).innerHTML = savings;
        parentDiv.querySelector(`.save-${productId}`).style.visibility = 'visible';
      } else {
        document.querySelectorAll(`.save-${productId}`).forEach((item) => {
          item.innerHTML = savings;
          item.style.visibility = 'visible';
        });
      }
    }

    // todo: extract query selector just to used once for perf reasons
    if (document.querySelector(`.percent-${productId}`)) {
      if (triggerVPN) {
        parentDiv.querySelector(`.percent-${productId}`).innerHTML = `${percentageSticker}%`;
        parentDiv.querySelector(`.percent-${productId}`).style.visibility = 'visible';
        parentDiv.querySelector(`.percent-${productId}`).parentNode.style.visibility = 'visible';
      } else {
        document.querySelectorAll(`.percent-${productId}`).forEach((item) => {
          item.innerHTML = `${percentageSticker}%`;
          item.style.visibility = 'visible';
          const parentElement = item.parentNode;
          parentElement.style.visibility = 'visible';
        });
      }
    }

    if (document.querySelector(`.bulina-${productId}`)) {
      const bulinaElement = document.querySelector(`.bulina-${productId}`);
      const parentElement = bulinaElement.parentNode;
      parentElement.style.visibility = 'visible';
    }

    // todo: extract query selector just to used once for perf reasons
    if (document.querySelector(`.show_save_${productId}`)) {
      document.querySelector(`.show_save_${productId}`).style.display = 'block';
    }
  } else {
    // todo: extract query selector just to used once for perf reasons
    const fullPrice = formatPrice(selectedVarPrice, currencyLabel, regionId);
    if (document.querySelector(`.newprice-${productId}`)) {
      document.querySelector(`.newprice-${productId}`).innerHTML = fullPrice;
    }
    // todo: extract query selector just to used once for perf reasons
    if (document.querySelector(`.oldprice-${productId}`)) {
      document.querySelector(`.oldprice-${productId}`).style.display = 'none';
    }

    // todo: extract query selector just to used once for perf reasons
    if (document.querySelector(`.save-${productId}`)) {
      const saveElement = document.querySelector(`.save-${productId}`);
      const parentElement = saveElement.parentNode;
      const siblingElements = parentElement.parentNode.querySelectorAll('div');

      siblingElements.forEach((element) => {
        element.style.visibility = 'hidden';
        element.style.display = 'none';
      });
    }

    // todo: extract query selector just to used once for perf reasons
    if (document.querySelector(`.percent-${productId}`)) {
      const percentElement = document.querySelector(`.percent-${productId}`);
      const parentElement = percentElement.parentNode;

      parentElement.style.visibility = 'hidden';
      parentElement.style.display = 'none';
    }

    // todo: extract query selector just to used once for perf reasons
    if (document.querySelector(`.show_save_${productId}`)) {
      document.querySelector(`.show_save_${productId}`).style.display = 'none';
    }

    if (document.querySelector(`.bulina-${productId}`)) {
      const bulinaElement = document.querySelector(`.bulina-${productId}`);
      const parentElement = bulinaElement.parentNode;

      parentElement.style.visibility = 'hidden';
    }
  }

  // todo: extract query selector just to used once for perf reasons
  // todo: why document.querySelector(`.buylink-${productId}`) and then parentDiv.querySelector(`.buylink-${productId}`) ?
  if (isZuoraForNetherlandsLangMode() && document.querySelector(`.buylink-${productId}`)) {
    if (triggerVPN) {
      parentDiv.querySelector(`.buylink-${productId}`).href = buyLink;
    } else {
      document.querySelectorAll(`.buylink-${productId}`).forEach((item) => {
        item.href = buyLink;
      });
    }
  }

  maxDiscount();
}

export function getDatasetFromSection(block) {
  const parentSelector = block.closest('.section');
  return parentSelector.dataset;
}

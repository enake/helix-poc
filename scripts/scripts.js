import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

import { sendAnalyticsPageEvent, sendAnalyticsUserInfo, sendAnalyticsProducts } from './adobeDataLayer.js';
import { DEFAULT_LANGUAGE, instance } from './utils.js';

const productsList = [];

export const productAliases = (name) => {
  let newName = name.trim();
  if (newName === 'elite') {
    newName = 'elite_1000';
  } else if (newName === 'bs') {
    newName = 'bus-security';
  }

  return newName;
};

// TODO: use the function from adobeDataLayer.js
export const getParam = (param) => {
  const gUrlParams = {};
  try {
    (() => {
      let e;
      const a = /\+/g;
      const r = /([^&=]+)=?([^&]*)/g;
      const d = (s) => decodeURIComponent(s.replace(a, ' '));
      const q = window.location.search.substring(1);

      // eslint-disable-next-line no-cond-assign
      while (e = r.exec(q)) gUrlParams[d(e[1])] = d(e[2]);
    })();

    if (typeof gUrlParams[param] || gUrlParams[param] !== '') {
      return gUrlParams[param];
    }
    return false;
  } catch (ex) { return false; }
};

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
const buildHeroBlock = (main) => {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
};

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
const buildAutoBlocks = (main) => {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
};

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export const decorateMain = (main) => {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
};

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
const loadEager = async (doc) => {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
};

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
const addFavIcon = (href) => {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
};

// add new script file
export const addScript = (src, data = {}, type = undefined) => new Promise((resolve, reject) => {
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

  s.addEventListener('load', resolve);
  s.addEventListener('error', reject);

  document.body.appendChild(s);
});

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
const loadLazy = async (doc) => {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));

  await sendAnalyticsPageEvent();
  sendAnalyticsUserInfo();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon('https://www.bitdefender.com/favicon.ico');

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
};

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
const loadDelayed = () => {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
};

// clean cleanBlockDOM
// export const cleanBlockDOM = (element) => {
//   document.querySelector(element).innerHTML = '';
// };

// create a DOM element
// export const createDomElement = (parent, tagName, idName, className, content, addAttr) => {
//   let err = false;
//   let element = '';
//
//   if (typeof parent === 'undefined' || parent == '') {
//     parent = 'main';
//   }
//
//   if (typeof tagName !== 'undefined' && tagName !== '') {
//     element = document.createElement(tagName);
//   } else {
//     err = true;
//   }
//
//   if (typeof idName !== 'undefined' && idName !== '') {
//     element.id = idName;
//   }
//
//   if (typeof className !== 'undefined' && className !== '') {
//     element.className = className;
//   }
//
//   if (typeof content !== 'undefined' && content !== '') {
//     element.textContent = content;
//   }
//
//   if (typeof addAttr !== 'undefined' && addAttr.length > 0) {
//     element.setAttribute(addAttr.name, addAttr.value);
//   }
//
//   // console.log(document.querySelector(parent))
//   if (!err && typeof parent !== 'undefined' && document.querySelector(parent) !== null) {
//     document.querySelector(parent).appendChild(element);
//   }
// };

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      decorateMain(main);
      await loadBlocks(main);
      return main;
    }
  }
  return null;
}

// append to DOM specific element
// export const appendDomElement = (parent, content) => {
//   if (typeof parent === 'undefined' && parent === '') {
//     parent = 'main';
//   }
//
//   if (typeof content !== 'undefined' & content !== '') {
//     if (content.innerHTML.includes('[') && content.innerHTML.includes(']')) {
//       // content = content.innerHTML.replace("[", '<span class="greenBck">').replace("]", '</span>');
//     }
//
//     document.querySelector(parent).appendChild(content);
//   }
// };

// add specific Attribute to a DOM element
// export const addAttr2DomElement = (attrName, attrValue, element) => {
//   if (typeof attrName !== 'undefined' && attrName !== '' && typeof attrValue !== 'undefined' && attrValue !== '' && typeof element !== 'undefined' && element !== '') {
//     document.querySelector(element).setAttribute(attrName, attrValue);
//   } else {
//     console.log('insuficient data');
//   }
// };

// split only the last element
// export const splitLastOccurrence = (string, element) => {
//   const lastIndex = string.indexOf(element);
//   const before = string.slice(0, lastIndex);
//   const after = string.slice(lastIndex + 1);
//
//   return [before, after];
// };

// Helper function to find the closest parent with a specific class
const findClosestParentByClass = (element, className) => {
  let parent = element.parentNode;

  while (parent) {
    if (parent.classList.contains(className)) {
      return parent;
    }
    parent = parent.parentNode;
  }

  return null;
};

// display prices for VPN
const showPriceVPN = (selector) => {
  if (typeof selector.selected_variation.discount === 'object') {
    const discPrice = selector.selected_variation.discount.discounted_price;
    const fullPrice = selector.selected_variation.price;
    let save = fullPrice - discPrice;
    save = save.toFixed(0);
    let saveProc = (save / fullPrice) * 100;
    saveProc = `${Math.round(saveProc.toFixed(2))}%`;

    if (document.querySelector(`.percent-${selector.config.product_id}`)) {
      document.querySelectorAll(`.percent-${selector.config.product_id}`).forEach((item) => {
        item.innerText = saveProc;
      });
    }
  } else {
    if (document.querySelector(`.show_save_${selector.config.product_id}`)) {
      document.querySelectorAll(`.show_save_${selector.config.product_id}`).forEach((item) => {
        item.style.display = 'none';
      });
    }

    if (document.querySelector(`.${selector.config.full_price_class}`)) {
      document.querySelectorAll(`.${selector.config.full_price_class}`).forEach((item) => {
        item.style.display = 'none';
      });
    }

    if (document.querySelector(`.${selector.config.discounted_price_class}`) && document.querySelector(`.${selector.config.full_price_class}`)) {
      document.querySelectorAll(`.${selector.config.discounted_price_class}`).forEach((item) => {
        item.innerHTML = document.querySelector(`.${selector.config.full_price_class}`).innerHTML;
      });
    }
  }
};

// display prices for normal vpn
const showPrice = (storeObj) => {
  const { currency_label: currencyLabel } = storeObj.selected_variation;
  const { region_id: regionId } = storeObj.selected_variation;
  const { product_id: productId } = storeObj.config;

  if (typeof storeObj.selected_variation.discount === 'object') {
    const fullPrice = StoreProducts.formatPrice(storeObj.selected_variation.price, currencyLabel, regionId);
    const offerPrice = StoreProducts.formatPrice(storeObj.selected_variation.discount.discounted_price, currencyLabel, regionId);
    const savingsPrice = storeObj.selected_variation.price - storeObj.selected_variation.discount.discounted_price;
    const savings = StoreProducts.formatPrice(savingsPrice.toFixed(0), currencyLabel, regionId);
    const percentageSticker = (((storeObj.selected_variation.price - storeObj.selected_variation.discount.discounted_price) / storeObj.selected_variation.price) * 100).toFixed(0);

    if (document.querySelector(`.oldprice-${productId}`)) {
      document.querySelectorAll(`.oldprice-${productId}`).forEach((item) => {
        item.innerHTML = fullPrice;
        item.style.display = 'block';
      });
    }

    if (document.querySelector(`.newprice-${productId}`)) {
      document.querySelectorAll(`.newprice-${productId}`).forEach((item) => {
        item.innerHTML = offerPrice;
      });
    }

    if (document.querySelector(`.save-${productId}`)) {
      document.querySelectorAll(`.save-${productId}`).forEach((item) => {
        item.innerHTML = savings;
        item.style.visibility = 'visible';
      });
    }

    if (document.querySelector(`.percent-${productId}`)) {
      document.querySelectorAll(`.percent-${productId}`).forEach((item) => {
        item.innerHTML = `${percentageSticker}%`;
        item.style.visibility = 'visible';
        const parentElement = item.parentNode;
        parentElement.style.visibility = 'visible';
      });
    }

    if (document.querySelector(`.bulina-${productId}`)) {
      const bulinaElement = document.querySelector(`.bulina-${productId}`);
      const parentElement = bulinaElement.parentNode;
      parentElement.style.visibility = 'visible';
    }

    if (document.querySelector(`.show_save_${productId}`)) {
      document.querySelector(`.show_save_${productId}`).style.display = 'block';
    }
  } else {
    const fullPrice = StoreProducts.formatPrice(storeObj.selected_variation.price, currencyLabel, regionId);
    if (document.querySelector(`.newprice-${productId}`)) {
      document.querySelector(`.newprice-${productId}`).innerHTML = fullPrice;
    }
    if (document.querySelector(`.oldprice-${productId}`)) {
      document.querySelector(`.oldprice-${productId}`).style.display = 'none';
    }

    if (document.querySelector(`.save-${productId}`)) {
      const saveElement = document.querySelector(`.save-${productId}`);
      const parentElement = saveElement.parentNode;
      const siblingElements = parentElement.parentNode.querySelectorAll('div');

      siblingElements.forEach((element) => {
        element.style.visibility = 'hidden';
        element.style.display = 'none';
      });
    }

    if (document.querySelector(`.percent-${productId}`)) {
      const percentElement = document.querySelector(`.percent-${productId}`);
      const parentElement = percentElement.parentNode;

      parentElement.style.visibility = 'hidden';
      parentElement.style.display = 'none';
    }

    if (document.querySelector(`.oldprice-${productId}`) && document.querySelector(`.save-${productId}`)) {
      const oldPriceElement = document.querySelector(`.oldprice-${productId}`);
      const infoRowElement = findClosestParentByClass(oldPriceElement, 'info-row');

      infoRowElement.style.display = 'none';
    }

    if (document.querySelector(`.show_save_${productId}`)) {
      document.querySelector(`.show_save_${productId}`).style.display = 'none';
    }

    if (document.querySelector(`.bulina-${productId}`)) {
      const bulinaElement = document.querySelector(`.bulina-${productId}`);
      const parentElement = bulinaElement.parentNode;

      parentElement.style.visibility = 'hidden';
    }
  }
};

// check & update ProductsList
// TODO: have a look at StoreProducts.product & StoreProducts.initCount
// maybe we can use them instead of this function
export const updateProductsList = (product) => {
  if (productsList.indexOf(product) === -1) {
    productsList.push(product);
  }
};

const addVpnBD = (data, showVpn) => {
  /* if (geoip_code() == 'cn' || geoip_code() == 'in') {
      return false;
    } */

  const { product_id: productId } = data.config;
  const discPriceClass = data.config.discounted_price_class;
  const { buy_class: buyClass } = data.config;
  const saveClass = `save-${productId}`;
  const savevpnClass = `savevpn-${productId}`;

  const { price_class: priceClass } = data.config;
  const { users_class: usersClass } = data.config;
  const { years_class: yearsClass } = data.config;
  const selectedUsers = document.querySelector(`.${usersClass}`).value;
  const selectedYears = document.querySelector(`.${yearsClass}`).value;
  let defaultLink = '';

  if (document.querySelector(`.${buyClass}`)) {
    defaultLink = StoreProducts.appendVisitorID(document.querySelector(`.${buyClass}`).getAttribute('href'));
  }

  // missing params
  let buylinkVpn = '';
  let currency = 'USD';
  let save = '';
  let justVpn = '';
  let newPrice = '';
  let ref = '';

  let pidCode = getParam('pid');
  if (pidCode) {
    pidCode = pidCode.split('_PGEN')[0];
  }
  const pidUrlBundle = `/pid.${pidCode}`;

  let renewLps = false;
  if (getParam('renew_lps') || (getParam('pid') && getParam('pid').toLowerCase().indexOf('renew') !== -1)) {
    renewLps = true;
  }

  let checkboxId = '';
  if (document.querySelector(`.checkboxVPN-${productId}`)) {
    checkboxId = document.querySelector(`.checkboxVPN-${productId}`).getAttribute('data-id');
  }

  const checkboxNotChecked = !document.querySelector(`.checkboxVPN-${productId}`).checked;
  if (checkboxNotChecked) {
    document.querySelector(`.${showVpn}`).style.display = 'none';
    checkboxId = this?.getAttribute('data-id');
  }

  const changeHandler = () => {
    const productVpn = 'vpn';

    const sVariation = StoreProducts.product[productId].variations[selectedUsers][selectedYears];
    const vb = StoreProducts.product[productVpn].variations[10][1];

    // const v = StoreProducts.getBundleProductsInfo(sVariation, vb);

    let updatedBuyLink = defaultLink;
    let priceVpn = vb.price;
    let fullPrice = '';

    if (document.getElementById(checkboxId).checked) {
      document.querySelectorAll(`.checkboxVPN-${productId}`).forEach((item) => {
        if (!item.checked) {
          item.checked = true;
        }
      });

      const showVpnEl = document.querySelector(`.${showVpn}`);

      if (showVpnEl) {
        showVpnEl.style.display = 'block';
      }

      const saveVpnEl = document.querySelector(`.${savevpnClass}`);

      if (saveVpnEl) {
        saveVpnEl.style.display = 'block';
      }

      const showVpnProductIdEl = document.querySelector(`.show_vpn-${productId}`);

      if (showVpnProductIdEl) {
        showVpnProductIdEl.style.display = 'block';
      }

      // document.querySelector('.' + save_class).style.display = 'none';

      let linkRef = '';

      if (productId === 'av') {
        if (DEFAULT_LANGUAGE === 'uk') {
          linkRef = 'WEBSITE_UK_AVBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'de') {
          linkRef = 'WEBSITE_DE_AVBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'ro') {
          linkRef = 'WEBSITE_RO_AVBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'es') {
          linkRef = 'WEBSITE_ES_AVBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'fr') {
          linkRef = 'WEBSITE_FR_AVBUNDLE';
        } else {
          linkRef = 'WEBSITE_COM_AVBUNDLE';
        }
      }
      if (productId === 'is') {
        if (DEFAULT_LANGUAGE === 'uk') {
          linkRef = 'WEBSITE_UK_ISBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'de') {
          linkRef = 'WEBSITE_DE_ISBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'ro') {
          linkRef = 'WEBSITE_RO_ISBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'es') {
          linkRef = 'WEBSITE_ES_ISBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'fr') {
          linkRef = 'WEBSITE_FR_ISBUNDLE';
        } else {
          linkRef = 'WEBSITE_COM_ISBUNDLE';
        }
      }
      if (productId === 'tsmd') {
        if (DEFAULT_LANGUAGE === 'uk') {
          linkRef = 'WEBSITE_UK_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'de') {
          linkRef = 'WEBSITE_DE_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'ro') {
          linkRef = 'WEBSITE_RO_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'es') {
          linkRef = 'WEBSITE_ES_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'fr') {
          linkRef = 'WEBSITE_FR_TSMULTIBUNDLE';
        } else {
          linkRef = 'WEBSITE_COM_TSMULTIBUNDLE';
        }
      }
      if (productId === 'fp') {
        if (DEFAULT_LANGUAGE === 'uk') {
          linkRef = 'WEBSITE_UK_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'de') {
          linkRef = 'WEBSITE_DE_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'ro') {
          linkRef = 'WEBSITE_RO_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'es') {
          linkRef = 'WEBSITE_ES_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'fr') {
          linkRef = 'WEBSITE_FR_TSMULTIBUNDLE';
        } else {
          linkRef = 'WEBSITE_COM_TSMULTIBUNDLE';
        }
      }
      if (productId === 'soho') {
        if (DEFAULT_LANGUAGE === 'uk') {
          linkRef = 'WEBSITE_UK_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'de') {
          linkRef = 'WEBSITE_DE_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'ro') {
          linkRef = 'WEBSITE_RO_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'es') {
          linkRef = 'WEBSITE_ES_TSMULTIBUNDLE';
        } else if (DEFAULT_LANGUAGE === 'fr') {
          linkRef = 'WEBSITE_FR_TSMULTIBUNDLE';
        } else {
          linkRef = 'WEBSITE_COM_TSMULTIBUNDLE';
        }
      }

      if (linkRef.length > 0) ref = `/REF.${linkRef}`;

      if (DEFAULT_LANGUAGE === 'au') currency = 'AUD';
      else currency = sVariation.currency_iso;

      const coupon = renewLps ? {
        8: {
          USD: ['RENEW_UPGRADE_ADN2'],
          CAD: ['RENEW_UPGRADE_ADN2'],
          EUR: ['RENEW_UPGRADE_ADN'],
          ZAR: ['RENEW_UPGRADE_ADN'],
          MXN: ['RENEW_UPGRADE_ADN'],
          ALL: ['RENEW_UPGRADE_ADN'],
        },
        2: {
          USD: ['RENEW_UPGRADE_ADN2'],
          CAD: ['RENEW_UPGRADE_ADN2'],
          EUR: ['RENEW_UPGRADE_ADN'],
          ZAR: ['RENEW_UPGRADE_ADN'],
          MXN: ['RENEW_UPGRADE_ADN'],
          ALL: ['RENEW_UPGRADE_ADN'],
        },
        16: {
          USD: ['RENEW_UPGRADE_ADN'],
          CAD: ['RENEW_UPGRADE_ADN'],
          EUR: ['RENEW_UPGRADE_ADN'],
          ZAR: ['RENEW_UPGRADE_ADN'],
          MXN: ['RENEW_UPGRADE_ADN'],
          ALL: ['RENEW_UPGRADE_ADN'],
        },
        10: {
          CAD: ['RENEW_UPGRADE_ADN'],
          ALL: ['RENEW_UPGRADE_ADN'],
        },
        4: {
          AUD: ['RENEW_UPGRADE_ADN'],
          NZD: ['RENEW_UPGRADE_ADN'],
        },
        3: {
          GBP: ['RENEW_UPGRADE_ADN'],
          EUR: ['RENEW_UPGRADE_ADN'],
        },
        14: {
          EUR: ['RENEW_UPGRADE_ADN'],
          ALL: ['RENEW_UPGRADE_ADN'],
        },
        22: {
          EUR: ['RENEW_UPGRADE_ADN'],
        },
        9: {
          EUR: ['RENEW_UPGRADE_ADN'],
        },
        7: {
          EUR: ['RENEW_UPGRADE_ADN'],
        },
        6: {
          RON: ['RENEW_UPGRADE_ADN'],
          ALL: ['RENEW_UPGRADE_ADN'],
        },
        13: { BRL: ['RENEW_UPGRADE_ADN'] },
        5: { EUR: ['63372958410'], CHF: ['63372958410'] },
        12: { EUR: ['RENEW_UPGRADE_ADN'] },
        19: {
          ZAR: ['RENEW_UPGRADE_ADN'],
        },
        17: { EUR: ['63372958410'], CHF: ['63372958410'] },
        72: {
          JPY: ['RENEW_UPGRADE_ADN'],
        },
        26: {
          SEK: ['RENEW_UPGRADE_ADN'],
        },
        28: {
          HUF: ['RENEW_UPGRADE_ADN'],
        },
        20: {
          MXN: ['RENEW_UPGRADE_ADN'],
        },
      } : {
        8: {
          USD: ['VPN_XNA2'],
          CAD: ['VPN_XNA2'],
          EUR: ['VPN_XNA'],
          ZAR: ['VPN_XNA'],
          MXN: ['VPN_XNA'],
          ALL: ['VPN_XNA'],
        },
        2: {
          USD: ['VPN_XNA2'],
          CAD: ['VPN_XNA2'],
          EUR: ['VPN_XNA'],
          ZAR: ['VPN_XNA'],
          MXN: ['VPN_XNA'],
          ALL: ['VPN_XNA'],
        },
        16: {
          USD: ['VPN_XNA'],
          CAD: ['VPN_XNA'],
          EUR: ['VPN_XNA'],
          ZAR: ['VPN_XNA'],
          MXN: ['VPN_XNA'],
          ALL: ['VPN_XNA'],
        },
        10: {
          CAD: ['VPN_XNA'],
          ALL: ['VPN_XNA'],
        },
        4: {
          AUD: ['VPN_XNA'],
          NZD: ['VPN_XNA'],
        },
        3: {
          GBP: ['VPN_XNA'],
          EUR: ['VPN_XNA'],
        },
        14: {
          EUR: ['VPN_XNA'],
          ALL: ['VPN_XNA'],
        },
        22: {
          EUR: ['VPN_XNA'],
        },
        9: {
          EUR: ['VPN_XNA'],
        },
        7: {
          EUR: ['VPN_XNA'],
        },
        6: {
          RON: ['VPN_XNA'],
          ALL: ['VPN_XNA'],
        },
        13: { BRL: ['VPN_XNA'] },
        5: { EUR: ['63372958210'], CHF: ['63372958210'] },
        12: { EUR: ['VPN_XNA'] },
        17: { EUR: ['63372958210'], CHF: ['63372958210'] },
        72: { JPY: ['VPN_XNA'] },
        // alea multe
        11: { INR: ['VPN_XNA'] },
        23: { KRW: ['VPN_XNA'] },
        19: { ZAR: ['VPN_XNA'] },
        20: { MXN: ['VPN_XNA'] },
        21: { MXN: ['VPN_XNA'] },
        25: { SGD: ['VPN_XNA'] },
        26: { SEK: ['VPN_XNA'] },
        27: { DKK: ['VPN_XNA'] },
        28: { HUF: ['VPN_XNA'] },
        29: { BGN: ['VPN_XNA'] },
        31: { NOK: ['VPN_XNA'] },
        36: { SAR: ['VPN_XNA'] },
        38: { AED: ['VPN_XNA'] },
        39: { ILS: ['VPN_XNA'] },
        41: { HKD: ['VPN_XNA'] },
        46: { PLN: ['VPN_XNA'] },
        47: { CZK: ['VPN_XNA'] },
        49: { TRY: ['VPN_XNA'] },
        50: { IDR: ['VPN_XNA'] },
        51: { PHP: ['VPN_XNA'] },
        52: { TWD: ['VPN_XNA'] },
        54: { CLP: ['VPN_XNA'] },
        55: { MYR: ['VPN_XNA'] },
        57: { PEN: ['VPN_XNA'] },
        59: { HRK: ['VPN_XNA'] },
        66: { THB: ['VPN_XNA'] },
      };

      if (DEFAULT_LANGUAGE === 'de') {
        if (typeof coupon[sVariation.region_id] !== 'undefined' && coupon[sVariation.region_id][currency] !== 'undefined') {
          buylinkVpn = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${sVariation.platform_id}/region.${sVariation.region_id}${ref}${pidUrlBundle}/force.2`;
          buylinkVpn += `/${productVpn}/${10}/${1}/OfferID.${coupon[sVariation.region_id][currency]}/platform.${sVariation.platform_id}/region.${sVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
          // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
        } else if (typeof coupon[sVariation.region_id] !== 'undefined' && coupon[sVariation.region_id].ALL !== 'undefined') {
          buylinkVpn = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${sVariation.platform_id}/region.${sVariation.region_id}${ref}${pidUrlBundle}/force.2`;
          buylinkVpn += `/${productVpn}/${10}/${1}/OfferID.${coupon[sVariation.region_id].ALL}/platform.${sVariation.platform_id}/region.${sVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
          // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
        } else {
          buylinkVpn = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${sVariation.platform_id}/region.${sVariation.region_id}${ref}${pidUrlBundle}/force.2`;
          buylinkVpn += `/${productVpn}/${10}/${1}/platform.${sVariation.platform_id}/region.${sVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
        }
      } else if (coupon[sVariation.region_id][currency] !== 'undefined') {
        buylinkVpn = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${sVariation.platform_id}/region.${sVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buylinkVpn += `/${productVpn}/${10}/${1}/COUPON.${coupon[sVariation.region_id][currency]}/platform.${sVariation.platform_id}/region.${sVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
        // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
      } else if (coupon[sVariation.region_id].ALL !== 'undefined') {
        buylinkVpn = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${sVariation.platform_id}/region.${sVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buylinkVpn += `/${productVpn}/${10}/${1}/COUPON.${coupon[sVariation.region_id].ALL}/platform.${sVariation.platform_id}/region.${sVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
        // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
      } else {
        buylinkVpn = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${sVariation.platform_id}/region.${sVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buylinkVpn += `/${productVpn}/${10}/${1}/platform.${sVariation.platform_id}/region.${sVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
      }

      if (data.selected_variation.discount && vb.discount) {
        fullPrice = Math.round((parseFloat(data.selected_variation.price) + parseFloat(priceVpn)) * 100) / 100;
        priceVpn = Math.round((parseFloat(data.selected_variation.discount.discounted_price) + parseFloat(vb.discount.discounted_price)) * 100) / 100;
        save = Math.round(parseFloat(fullPrice) - parseFloat(priceVpn));
        justVpn = parseFloat(vb.discount.discounted_price.replace('$', '').replace('â‚¬', '').replace('Â£', '').replace('R$', '')
          .replace('AUD', ''));
      } else if (vb.discount) {
        fullPrice = Math.round((parseFloat(data.selected_variation.price) + parseFloat(vb.price)) * 100) / 100;
        priceVpn = Math.round((parseFloat(data.selected_variation.price) + parseFloat(vb.discount.discounted_price)) * 100) / 100;
        save = Math.round(parseFloat(fullPrice) - parseFloat(priceVpn));
        justVpn = parseFloat(vb.discount.discounted_price.replace('$', '').replace('â‚¬', '').replace('Â£', '').replace('R$', '')
          .replace('AUD', ''));

        const showSaveProductIdEl = document.querySelector(`.show_save_${data.config.product_id}`);

        if (showSaveProductIdEl) {
          showSaveProductIdEl.style.display = 'block';
        }
      } else {
        justVpn = parseFloat(vb.price.replace('$', '').replace('â‚¬', '').replace('Â£', '').replace('R$', '')
          .replace('AUD', ''));
        fullPrice = Math.round((parseFloat(data.selected_variation.price) + parseFloat(justVpn)) * 100) / 100;
        save = Math.round(parseFloat(fullPrice) - parseFloat(priceVpn));
        if (data.selected_variation.discount) {
          priceVpn = Math.round((parseFloat(data.selected_variation.discount.discounted_price) + justVpn) * 100) / 100;
        } else {
          priceVpn = Math.round((parseFloat(data.selected_variation.price) + justVpn) * 100) / 100;
        }
      }

      priceVpn = StoreProducts.formatPrice(priceVpn, sVariation.currency_label, sVariation.region_id, sVariation.currency_iso);
      justVpn = StoreProducts.formatPrice(justVpn, sVariation.currency_label, sVariation.region_id, sVariation.currency_iso);

      if (data.selected_variation.discount) {
        fullPrice = StoreProducts.formatPrice(fullPrice, sVariation.currency_label, sVariation.region_id, sVariation.currency_iso);
      }

      save = StoreProducts.formatPrice(save, sVariation.currency_label, sVariation.region_id, sVariation.currency_iso);

      updatedBuyLink = buylinkVpn;

      if (document.querySelector(`.${discPriceClass}`)) {
        document.querySelectorAll(`.${discPriceClass}`).forEach((item) => {
          item.innerHTML = priceVpn;
        });
      }

      const priceVpnEl = document.querySelector(`.price_vpn-${productId}`);

      if (priceVpnEl) {
        priceVpnEl.innerHTML = justVpn;
      }
    } else { // not checked
      document.querySelectorAll(`.checkboxVPN-${productId}`).forEach((item) => {
        if (item.checked) {
          item.checked = false;
        }
      });

      const showVpnEl = document.querySelector(`.${showVpn}`);

      if (showVpnEl) {
        showVpnEl.style.display = 'none';
      }

      const showVpnProductIdEl = document.querySelector(`.show_vpn-${productId}`);

      if (showVpnProductIdEl) {
        showVpnProductIdEl.style.display = 'none';
      }

      if (data.selected_variation.discount) {
        fullPrice = Math.round(parseFloat(data.selected_variation.price) * 100) / 100;
        newPrice = Math.round(parseFloat(data.selected_variation.discount.discounted_price) * 100) / 100;
        save = Math.round(parseFloat(fullPrice) - parseFloat(newPrice));
        if (document.querySelector(`.show_save_${data.config.product_id}`)) {
          document.querySelector(`.show_save_${data.config.product_id}`).style.display = 'block';
        }
      } else {
        fullPrice = Math.round(parseFloat(data.selected_variation.price) * 100) / 100;
        newPrice = fullPrice;
        save = 0;

        const showSaveProductIdEl = document.querySelector(`.show_save_${data.config.product_id}`);

        if (showSaveProductIdEl) {
          showSaveProductIdEl.style.display = 'none';
        }
      }

      buylinkVpn = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${sVariation.platform_id}/region.${sVariation.region_id}${ref}${buylinkVpn}/force.2`;

      fullPrice = StoreProducts.formatPrice(fullPrice, sVariation.currency_label, sVariation.region_id, sVariation.currency_iso);
      save = StoreProducts.formatPrice(save, sVariation.currency_label, sVariation.region_id, sVariation.currency_iso);
      newPrice = StoreProducts.formatPrice(newPrice, sVariation.currency_label, sVariation.region_id, sVariation.currency_iso);

      if (document.querySelector(`.${buyClass}`)) {
        document.querySelectorAll(`.${discPriceClass}`).forEach((item) => {
          item.setAttribute('href', defaultLink);
        });
      }

      if (document.querySelector(`.${discPriceClass}`)) {
        document.querySelectorAll(`.${discPriceClass}`).forEach((item) => {
          item.innerHTML = newPrice;
        });
      }
    }

    if (document.querySelector(`.${buyClass}`)) {
      document.querySelectorAll(`.${buyClass}`).forEach((item) => {
        item.setAttribute('href', StoreProducts.appendVisitorID(updatedBuyLink));
      });
    }

    if (fullPrice !== '' && document.querySelector(`.${priceClass}`)) {
      document.querySelectorAll(`.${priceClass}`).forEach((item) => {
        item.innerHTML = fullPrice;
      });
    }

    if (fullPrice !== '' && document.querySelector(`.old${priceClass}`)) {
      document.querySelectorAll(`.old${priceClass}`).forEach((item) => {
        item.innerHTML = fullPrice;
      });
    }

    if (document.querySelector(`.${saveClass}`)) {
      document.querySelectorAll(`.${saveClass}`).forEach((item) => {
        item.innerHTML = save;
      });
    }
  };

  if (document.querySelector(`.checkboxVPN-${productId}`)) {
    document.querySelectorAll(`.checkboxVPN-${productId}`).forEach((item) => {
      item.addEventListener('click', (e) => {
        checkboxId = e.target.getAttribute('data-id');
        changeHandler();
      });
    });
  }
};

const initSelectors = () => {
  if (productsList.length > 0) {
    const fakeSelectorsBottom = document.createElement('div');
    fakeSelectorsBottom.id = 'fakeSelectors_bottom';
    document.querySelector('footer').before(fakeSelectorsBottom);

    productsList.forEach((prod) => {
      const prodSplit = prod.split('/');
      const prodAlias = productAliases(prodSplit[0].trim());
      const prodUsers = prodSplit[1].trim();
      const prodYears = prodSplit[2].trim();

      fakeSelectorsBottom.innerHTML += `<label>Fake Devices for ${prodAlias}: </label>`;
      const createSelectForDevices = document.createElement('select');
      createSelectForDevices.className = `users_${prodAlias}_fake`;
      document.getElementById('fakeSelectors_bottom').append(createSelectForDevices);

      fakeSelectorsBottom.innerHTML += `<label>Fake Years for ${prodAlias}: </label>`;
      const createSelectForYears = document.createElement('select');
      createSelectForYears.className = `years_${prodAlias}_fake`;
      document.getElementById('fakeSelectors_bottom').append(createSelectForYears);

      StoreProducts.initSelector({
        product_id: prodAlias,
        full_price_class: `oldprice-${prodAlias}`,
        discounted_price_class: `newprice-${prodAlias}`,
        price_class: `price-${prodAlias}`,
        buy_class: `buylink-${prodAlias}`,
        selected_users: prodUsers,
        selected_years: prodYears,
        users_class: `users_${prodAlias}_fake`,
        years_class: `years_${prodAlias}_fake`,
        extra_params: { pid: getParam('pid') },

        onSelectorLoad() {
          sendAnalyticsProducts(this);
          try {
            const fp = this;
            if (prodAlias === 'vpn') {
              showPriceVPN(fp);
            } else {
              addVpnBD(fp, `show_vpn_${prodAlias}`);
              showPrice(fp);
            }
          } catch (ex) { /* empty */ }
        },
      });
    });

    document.querySelectorAll('.checkboxVPN').forEach((checkbox, idx) => {
      checkbox.id += idx + 1;
      checkbox.setAttribute('data-id', checkbox.id);
    });
  }
};

const loadPage = async () => {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
  initSelectors();

  // getIpCountry().then(
  //   (ipCountry) => initSelectors(ipCountry),
  // );

  // adding IDs on each section
  document.querySelectorAll('main .section > div:first-of-type').forEach((item, idx) => {
    const getIdentity = item.className;
    item.parentElement.id = `${getIdentity}-${idx + 1}`;
  });
};

/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
const initMobileDetector = (viewport) => {
  const mobileDetectorDiv = document.createElement('div');
  mobileDetectorDiv.setAttribute(`data-${viewport}-detector`, '');
  document.body.prepend(mobileDetectorDiv);
};

/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
export const isView = (viewport) => {
  const element = document.querySelectorAll(`[data-${viewport}-detector]`)[0];
  return !!(element && getComputedStyle(element).display !== 'none');
};

function initBaseUri() {
  const domainName = 'bitdefender';
  const domainExtension = window.location.hostname.split('.').pop(); // com | ro | other

  window.BASE_URI = ['com', 'ro'].includes(domainExtension) ? `${window.location.protocol}//www.${domainName}.${domainExtension}/site` : `https://www.${domainName}.com/site`;
}

initMobileDetector('mobile');
initMobileDetector('tablet');
initMobileDetector('desktop');

initBaseUri();

loadPage();

addScript('/scripts/vendor/bootstrap/bootstrap.bundle.js', {}, 'defer');

await addScript('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js');
addScript('https://www.bitdefender.com/scripts/Store2015.min.js', {}, 'defer');

addScript('https://consent.cookiebot.com/uc.js', { culture: 'en', cbid: '4a55b566-7010-4633-9b03-7ba7735be0b6' }, 'defer');

if (instance === 'prod') addScript('https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-b1f76be4d2ee.min.js', {}, 'defer');
else addScript('https://assets.adobedtm.com/8a93f8486ba4/5492896ad67e/launch-3e7065dd10db-staging.min.js', {}, 'defer');

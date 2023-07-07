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
import { addScript, getDefaultLanguage } from './utils.js';

const DEFAULT_LANGUAGE = getDefaultLanguage();

const productsList = [];
const defaultBuyLinks = {};

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
  // decorateIcons2(main);
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

  sendAnalyticsUserInfo();
  await sendAnalyticsPageEvent();

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

// check & update ProductsList
// TODO: have a look at StoreProducts.product & StoreProducts.initCount
// maybe we can use them instead of this function
export const updateProductsList = (product) => {
  if (productsList.indexOf(product) === -1) {
    productsList.push(product);
  }
};

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

  const maxdiscount = Math.max(...discountAmounts).toString();
  if (document.querySelector('.max-discount')) {
    document.querySelectorAll('.max-discount').forEach((item) => {
      item.textContent = `${maxdiscount}%`;
    });
  }
};

// trigger for VPN checkbox click
const changeCheckboxVPN = (checkboxId) => {
  const parentDiv = document.getElementById(checkboxId).closest('div.prod_box');
  const comparativeDiv = document.querySelector('.c-top-comparative-with-text');
  const productId = checkboxId.split('-')[1];
  const discPriceClass = `.newprice-${productId}`;
  const priceClass = `.oldprice-${productId}`;
  const saveClass = `.save-${productId}`;
  let fullPrice = '';
  const selectedUsers = document.querySelector(`.users_${productId}_fake`).value;
  const selectedYears = document.querySelector(`.years_${productId}_fake`).value;
  const selectedVariation = StoreProducts.product[productId].variations[selectedUsers][selectedYears];

  // buy btn
  const buyClass = `.buylink-${productId}`;
  let buyLink = '';
  if (typeof defaultBuyLinks[productId] === 'undefined') {
    defaultBuyLinks[productId] = parentDiv.querySelector(buyClass).href;
  }
  const buyLinkDefault = defaultBuyLinks[productId];

  // vpn
  const vpnId = 'vpn';
  const showVpnBox = document.querySelector(`.show_vpn_${productId}`);
  const savevpnClass = `savevpn-${vpnId}`;
  const vpnObj = StoreProducts.product[vpnId].variations[10][1];
  const priceVpn = vpnObj.price;
  let linkRef = '';

  // missing params
  let currency = 'USD';
  let save = '';
  let justVpn = '';
  let newPrice = '';
  let ref = '';

  let promoPid = getParam('pid');
  if (promoPid) {
    promoPid = promoPid.split('_PGEN')[0];
  }
  const pidUrlBundle = `/pid.${promoPid}`;

  let renewLps = false;
  if (getParam('renew_lps') || (getParam('pid') && getParam('pid').toLowerCase().indexOf('renew') !== -1)) {
    renewLps = true;
  }
  // const v = StoreProducts.getBundleProductsInfo(selectedVariation, vpnObj);

  // if is checked
  if (document.getElementById(checkboxId).checked) {
    if (showVpnBox) {
      showVpnBox.style.display = 'block';
    }

    const saveVpnEl = parentDiv.querySelector(`.${savevpnClass}`);
    if (saveVpnEl) {
      saveVpnEl.style.display = 'block';
    }

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
    else currency = selectedVariation.currency_iso;

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
      if (typeof coupon[selectedVariation.region_id] !== 'undefined' && coupon[selectedVariation.region_id][currency] !== 'undefined') {
        buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buyLink += `/${vpnId}/${10}/${1}/OfferID.${coupon[selectedVariation.region_id][currency]}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
        // buyLink += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
      } else if (typeof coupon[selectedVariation.region_id] !== 'undefined' && coupon[selectedVariation.region_id].ALL !== 'undefined') {
        buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buyLink += `/${vpnId}/${10}/${1}/OfferID.${coupon[selectedVariation.region_id].ALL}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
        // buyLink += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
      } else {
        buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
        buyLink += `/${vpnId}/${10}/${1}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
      }
    } else if (coupon[selectedVariation.region_id][currency] !== 'undefined') {
      buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
      buyLink += `/${vpnId}/${10}/${1}/COUPON.${coupon[selectedVariation.region_id][currency]}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
      // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
    } else if (coupon[selectedVariation.region_id].ALL !== 'undefined') {
      buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
      buyLink += `/${vpnId}/${10}/${1}/COUPON.${coupon[selectedVariation.region_id].ALL}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
      // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
    } else {
      buyLink = `${StoreProducts.product[productId].base_uri}/Store/buybundle/${productId}/${selectedUsers}/${selectedYears}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}${ref}${pidUrlBundle}/force.2`;
      buyLink += `/${vpnId}/${10}/${1}/platform.${selectedVariation.platform_id}/region.${selectedVariation.region_id}/CURRENCY.${currency}/DCURRENCY.${currency}`;
    }

    if (selectedVariation.discount && vpnObj.discount) {
      fullPrice = Math.round((parseFloat(selectedVariation.price) + parseFloat(priceVpn)) * 100) / 100;
      newPrice = Math.round((parseFloat(selectedVariation.discount.discounted_price) + parseFloat(vpnObj.discount.discounted_price)) * 100) / 100;
      save = Math.round(parseFloat(fullPrice) - parseFloat(priceVpn));
      justVpn = parseFloat(
        vpnObj.discount.discounted_price
          .replace('$', '')
          .replace('â‚¬', '')
          .replace('Â£', '')
          .replace('R$', '')
          .replace('AUD', ''),
      );
    } else if (vpnObj.discount) {
      fullPrice = Math.round((parseFloat(selectedVariation.price) + parseFloat(vpnObj.price)) * 100) / 100;
      newPrice = Math.round((parseFloat(selectedVariation.price) + parseFloat(vpnObj.discount.discounted_price)) * 100) / 100;
      save = Math.round(parseFloat(fullPrice) - parseFloat(priceVpn));
      justVpn = parseFloat(
        vpnObj.discount.discounted_price
          .replace('$', '')
          .replace('â‚¬', '')
          .replace('Â£', '')
          .replace('R$', '')
          .replace('AUD', ''),
      );

      if (parentDiv.querySelector(`.show_save_${productId}`)) {
        parentDiv.querySelector(`.show_save_${productId}`).style.display = 'block';
      }
    } else {
      justVpn = parseFloat(
        vpnObj.price
          .replace('$', '')
          .replace('â‚¬', '')
          .replace('Â£', '')
          .replace('R$', '')
          .replace('AUD', ''),
      );
      fullPrice = Math.round((parseFloat(selectedVariation.price) + parseFloat(justVpn)) * 100) / 100;
      save = Math.round(parseFloat(fullPrice) - parseFloat(priceVpn));
      if (selectedVariation.discount) {
        newPrice = Math.round((parseFloat(selectedVariation.discount.discounted_price) + justVpn) * 100) / 100;
      } else {
        newPrice = Math.round((parseFloat(selectedVariation.price) + justVpn) * 100) / 100;
      }
    }

    if (parentDiv.querySelector(discPriceClass)) {
      parentDiv.querySelector(discPriceClass).innerHTML = newPrice;
      /*
      document.querySelectorAll(discPriceClass).forEach(item => {
        item.innerHTML = newPrice;
      })
      */
    }

    if (parentDiv.querySelector(`.price_vpn-${productId}`)) {
      parentDiv.querySelector(`.price_vpn-${productId}`).innerHTML = justVpn;
    }

    newPrice = StoreProducts.formatPrice(
      newPrice,
      selectedVariation.currency_label,
      selectedVariation.region_id,
      selectedVariation.currency_iso,
    );
  } else {
    // not checked
    if (showVpnBox) {
      showVpnBox.style.display = 'none';
    }

    if (selectedVariation.discount) {
      fullPrice = Math.round(parseFloat(selectedVariation.price) * 100) / 100;
      newPrice = Math.round(parseFloat(selectedVariation.discount.discounted_price) * 100) / 100;
      save = Math.round(parseFloat(fullPrice) - parseFloat(newPrice));
      if (parentDiv.querySelector(`.show_save_${productId}`)) {
        parentDiv.querySelector(`.show_save_${productId}`).style.display = 'block';
        /*
        document.querySelectorAll(`.show_save_${productId}`).forEach(item => {
          item.style.display = 'block';
        });
        */
      }
    } else {
      fullPrice = Math.round(parseFloat(selectedVariation.price) * 100) / 100;
      newPrice = fullPrice;
      save = 0;

      if (parentDiv.querySelector(`.show_save_${productId}`)) {
        parentDiv.querySelector(`.show_save_${productId}`).style.display = 'none';
        /*
        document.querySelectorAll(`.show_save_${productId}`).forEach(item => {
          item.style.display = 'none';
        });
        */
      }
    }

    fullPrice = StoreProducts.formatPrice(fullPrice, selectedVariation.currency_label, selectedVariation.region_id, selectedVariation.currency_iso);
    save = StoreProducts.formatPrice(save, selectedVariation.currency_label, selectedVariation.region_id, selectedVariation.currency_iso);
    newPrice = StoreProducts.formatPrice(newPrice, selectedVariation.currency_label, selectedVariation.region_id, selectedVariation.currency_iso);
    buyLink = buyLinkDefault;
  }

  if (parentDiv.querySelector(buyClass)) {
    parentDiv.querySelector(buyClass).setAttribute('href', buyLink);
    if (comparativeDiv && comparativeDiv.querySelector(buyClass)) {
      comparativeDiv.querySelector(buyClass).setAttribute('href', buyLink);
    }
  }

  if (parentDiv.querySelector(priceClass)) {
    parentDiv.querySelector(priceClass).innerHTML = fullPrice;
    if (comparativeDiv && comparativeDiv.querySelector(priceClass)) {
      comparativeDiv.querySelector(priceClass).innerHTML = fullPrice;
    }
  }

  if (parentDiv.querySelector(discPriceClass)) {
    parentDiv.querySelector(discPriceClass).innerHTML = newPrice;
    if (comparativeDiv && comparativeDiv.querySelector(discPriceClass)) {
      comparativeDiv.querySelector(discPriceClass).innerHTML = newPrice;
    }
  }

  if (parentDiv.querySelector(saveClass)) {
    parentDiv.querySelector(saveClass).innerHTML = save;
    if (comparativeDiv && comparativeDiv.querySelector(saveClass)) {
      comparativeDiv.querySelector(saveClass).innerHTML = save;
    }
  }
};

// display prices
const showPrices = (storeObj) => {
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

    if (document.querySelector(`.show_save_${productId}`)) {
      document.querySelector(`.show_save_${productId}`).style.display = 'none';
    }

    if (document.querySelector(`.bulina-${productId}`)) {
      const bulinaElement = document.querySelector(`.bulina-${productId}`);
      const parentElement = bulinaElement.parentNode;

      parentElement.style.visibility = 'hidden';
    }
  }

  maxDiscount();
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

      fakeSelectorsBottom.innerHTML += `<label for="u_${prodAlias}">Fake Devices for ${prodAlias}: </label>`;
      const createSelectForDevices = document.createElement('select');
      createSelectForDevices.id = `u_${prodAlias}`;
      createSelectForDevices.name = `u_${prodAlias}`;
      createSelectForDevices.className = `users_${prodAlias}_fake`;
      document.getElementById('fakeSelectors_bottom').append(createSelectForDevices);

      fakeSelectorsBottom.innerHTML += `<label for="y_${prodAlias}">Fake Years for ${prodAlias}: </label>`;
      const createSelectForYears = document.createElement('select');
      createSelectForYears.id = `y_${prodAlias}`;
      createSelectForYears.name = `y_${prodAlias}`;
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
            showPrices(fp);
          } catch (ex) { /* empty */ }
        },
      });
    });
  }
};

const loadPage = async () => {
  addScript('https://assets.adobedtm.com/8a93f8486ba4/e7dc9e6549e5/launch-aef7ddf31563-development.min.js', {}, 'defer');
  
  await loadEager(document);
  await loadLazy(document);

  addScript('/scripts/vendor/bootstrap/bootstrap.bundle.min.js', {}, 'defer');
  addScript('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', {}, 'async', () => {
    addScript('https://www.bitdefender.com/scripts/Store2015.min.js', {}, 'async', () => {
      initSelectors();
      loadDelayed();

      // adding IDs on each section
      document.querySelectorAll('main .section > div:first-of-type').forEach((item, idx) => {
        const getIdentity = item.className;
        item.parentElement.id = `${getIdentity}-${idx + 1}`;
      });

      // addEventListener on VPN checkboxes
      if (document.querySelector('.checkboxVPN')) {
        document.querySelectorAll('.checkboxVPN').forEach((item) => {
          item.addEventListener('click', (e) => {
            const checkboxId = e.target.getAttribute('id');
            changeCheckboxVPN(checkboxId);
          });
        });
      }
    });
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

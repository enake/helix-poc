/* eslint-disable linebreak-style */
/* eslint-disable */

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

const productsList = [];
export const DEFAULT_LANGUAGE = window.location.pathname.split("/")[2]

export const productAliases = (name) => {
  name = name.trim()
  if (name === 'elite') {
    name = 'elite_1000'
  } else if (name === 'bs') {
    name = 'bus-security'
  }
 
  return name
}

/*export const geoip_code = () => {
  $.get("https://ipinfo.io", function(response) {
    return response.country.toUpperCase();
  }, "jsonp");
}*/

export const getParam = (param) => {
  var g_urlParams = {};
  try {
    (function () {
        var e,
            a = /\+/g,
            r = /([^&=]+)=?([^&]*)/g,
            d = function (s) {
                return decodeURIComponent(s.replace(a, " "));
            },
            q = window.location.search.substring(1);

        while (e = r.exec(q))
            g_urlParams[d(e[1])] = d(e[2]);
    })();

    if (typeof g_urlParams[param] || g_urlParams[param] != '') {
      return g_urlParams[param]
    } else {
      return false
    }

  } catch (ex) {}
}


const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
const buildHeroBlock = main => {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
const buildAutoBlocks = main => {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export const decorateMain = main => {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
const loadEager = async doc => {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
const addFavIcon = href => {
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
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
const loadLazy = async doc => {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
const loadDelayed = () => {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

// clean cleanBlockDOM
export const cleanBlockDOM = (element)  => {
  document.querySelector(element).innerHTML = '';
}

// create a DOM element
export const createDomElement = (parent, tagName, idName, className, content, addAttr) => {
  let err = false;
  var element = '';

  if (typeof parent === 'undefined' || parent == '') {
    parent = 'main';
  }

  if (typeof tagName !== 'undefined' && tagName !== '') {
    element = document.createElement(tagName);
  } else {
    err = true;
  }

  if (typeof idName !== 'undefined' && idName !== '') {
    element.id = idName;
  }
  
  if (typeof className !== 'undefined' && className !== '') {
    element.className = className;
  }

  if (typeof content !== 'undefined' && content !== '') {
    element.textContent = content;
  }

  if (typeof addAttr !== 'undefined' && addAttr.length > 0) {
    element.setAttribute(addAttr['name'], addAttr['value']);
  }

  // console.log(document.querySelector(parent))
  if (!err && typeof parent !== 'undefined' && document.querySelector(parent) !== null) {
    document.querySelector(parent).appendChild(element);
  }
  
}

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
export const appendDomElement = (parent, content) => {
  if (typeof parent === 'undefined' &&  parent === '') {
    parent = 'main';
  }

  if (typeof content !== 'undefined' & content !== '') {
    if (content.innerHTML.includes('[') && content.innerHTML.includes(']')) {
      // content = content.innerHTML.replace("[", '<span class="greenBck">').replace("]", '</span>');
    }
    
    document.querySelector(parent).appendChild(content);
  }
}

// add specific Attribute to a DOM element
export const addAttr2DomElement = (attrName, attrValue, element) => {
  if (typeof attrName !== 'undefined' &&  attrName !== '' && typeof attrValue !== 'undefined' &&  attrValue !== '' && typeof element !== 'undefined' &&  element !== '') {
    document.querySelector(element).setAttribute(attrName, attrValue);
  } else {
    console.log('insuficient data');
  }
}

// split only the last element
export const splitLastOccurrence = (string, element) => {
  const lastIndex = string.indexOf(element);
  const before = string.slice(0, lastIndex);
  const after = string.slice(lastIndex + 1);

  return [before, after];
}

// add new script file
export const addScriptFile = (script_url) => {
  const script = document.createElement('script');
  script.setAttribute(
    'src',
    script_url,
  );
  // script.setAttribute('async', '');

  script.onload = function handleScriptLoaded() {
    console.log('script has loaded');
  };
  script.onerror = function handleScriptError() {
    console.log('error loading script');
  };
  document.head.appendChild(script);
}

// Helper function to find closest parent with a specific class
const findClosestParentByClass = (element, className) => {
  const parent = element.parentNode;

  while (parent) {
    if (parent.classList.contains(className)) {
      return parent;
    }
    parent = parent.parentNode;
  }

  return null;
}

// display prices for VPN
const showPriceVPN = (selector) => {
  // console.log(selector);
  if (typeof selector.selected_variation.discount === 'object') {
    const disc_price = selector.selected_variation.discount.discounted_price;
    const full_price = selector.selected_variation.price;
    let save = full_price - disc_price;
    save = save.toFixed(0);
    let save_proc = save / full_price * 100;
    save_proc = Math.round(save_proc.toFixed(2)) + "%";

    if (document.querySelector(".percent-" + selector.config.product_id)) {
      document.querySelectorAll(".percent-" + selector.config.product_id).forEach(item => {
        item.innerText = save_proc;
      })
    }

  } else {
    if (document.querySelector(".show_save_" + selector.config.product_id)) {
      document.querySelectorAll(".show_save_" + selector.config.product_id).forEach(item => {
        item.style.display = 'none';
      })
    }

    if (document.querySelector("." + selector.config.full_price_class)) {
      document.querySelectorAll("." + selector.config.full_price_class).forEach(item => {
        item.style.display = 'none';
      })
    }

    if (document.querySelector("." + selector.config.discounted_price_class) && document.querySelector("." + selector.config.full_price_class)) {
      document.querySelectorAll("." + selector.config.discounted_price_class).forEach(item => {
        item.innerHTML = document.querySelector("." + selector.config.full_price_class).innerHTML;
      })
    }

  }
}

// display prices for normal vpn
const showPrice = (storeObj) => {
  const currency_label = storeObj.selected_variation.currency_label;
  const region_id = storeObj.selected_variation.region_id;
  const product_id = storeObj.config.product_id;

  if (typeof storeObj.selected_variation.discount === "object") {
    const full_price = StoreProducts.formatPrice(storeObj.selected_variation.price, currency_label, region_id);
    const offer_price = StoreProducts.formatPrice(storeObj.selected_variation.discount.discounted_price, currency_label, region_id);
    const savings_price = storeObj.selected_variation.price - storeObj.selected_variation.discount.discounted_price;
    const savings = StoreProducts.formatPrice(savings_price.toFixed(0), currency_label, region_id);
    // var percentage_sticker = (((storeObj.selected_variation.price - storeObj.selected_variation.discount.discounted_price) * 100) / storeObj.selected_variation.price).toFixed(0);
    const percentage_sticker = (((storeObj.selected_variation.price - storeObj.selected_variation.discount.discounted_price) / storeObj.selected_variation.price) * 100).toFixed(0);
    // console.log(percentage_sticker);

    if (document.querySelector('.oldprice-' + product_id)) {
      document.querySelectorAll('.oldprice-' + product_id).forEach(item => {
        item.innerHTML = full_price;
        item.style.display = 'block';
      })
    }
    
    if (document.querySelector('.newprice-' + product_id)) {
      document.querySelectorAll('.newprice-' + product_id).forEach(item => {
        item.innerHTML = offer_price;
      })
    }
    
    if (document.querySelector('.save-' + product_id)) {
      document.querySelectorAll('.save-' + product_id).forEach(item => {
        item.innerHTML = savings;
        item.style.visibility = 'visible';
      })
    }
    
    if (document.querySelector('.percent-' + product_id)) {
      document.querySelectorAll('.percent-' + product_id).forEach(item => {
        item.innerHTML = percentage_sticker + '%';
        item.style.visibility = 'visible';
        const parentElement = item.parentNode;
        parentElement.style.visibility = 'visible';
      })
    }

    if (document.querySelector('.bulina-' + product_id)) {
      const bulinaElement = document.querySelector('.bulina-' + product_id);
      const parentElement = bulinaElement.parentNode;
      parentElement.style.visibility = 'visible';
    }

    if (document.querySelector('.show_save_' + product_id)) {
      document.querySelector('.show_save_' + product_id).style.display = 'block';
    }
  } else {
    const full_price = StoreProducts.formatPrice(storeObj.selected_variation.price, currency_label, region_id);
    if (document.querySelector('.newprice-' + product_id)) {
      document.querySelector('.newprice-' + product_id).innerHTML = full_price;
    }
    if (document.querySelector('.oldprice-' + product_id)) {
      document.querySelector('.oldprice-' + product_id).style.display = 'none';
    }

    if (document.querySelector('.save-' + product_id)) {
      const saveElement = document.querySelector('.save-' + product_id);
      const parentElement = saveElement.parentNode;
      const siblingElements = parentElement.parentNode.querySelectorAll('div');

      siblingElements.forEach(function(element) {
        element.style.visibility = 'hidden';
        element.style.display = 'none';
      });
    }
    
    if (document.querySelector('.percent-' + product_id)) {
      const percentElement = document.querySelector('.percent-' + product_id);
      const parentElement = percentElement.parentNode;

      parentElement.style.visibility = 'hidden';
      parentElement.style.display = 'none';
    }
    
    if (document.querySelector('.oldprice-' + product_id) && document.querySelector('.save-' + product_id)) {
      const oldPriceElement = document.querySelector('.oldprice-' + product_id);
      const saveElement = document.querySelector('.save-' + product_id);
      const infoRowElement = findClosestParentByClass(oldPriceElement, 'info-row');

      infoRowElement.style.display = 'none';
    }
    
    if (document.querySelector('.show_save_' + product_id)) {
      document.querySelector('.show_save_' + product_id).style.display = 'none';
    }

    if (document.querySelector('.bulina-' + product_id)) {
      const bulinaElement = document.querySelector('.bulina-' + product_id);
      const parentElement = bulinaElement.parentNode;

      parentElement.style.visibility = 'hidden';
    }
    
    // document.querySelector('.bulina-' + product_id).parent().css({'visibility': 'hidden'});
  }
}

// check & update ProductsList
export const updateProductsList = (product) => {
  if (productsList.indexOf(product) === -1) {
    productsList.push(product)
  }
}

const addVpnBD = (data, show_vpn) => {
    /*if (geoip_code() == 'cn' || geoip_code() == 'in') {
      return false;
    }*/
        
    const product_id = data.config.product_id;
    const disc_price_class = data.config.discounted_price_class;
    const buy_class = data.config.buy_class;
    const save_class = 'save-' + product_id;
    const savevpn_class = 'savevpn-' + product_id;

    const price_class = data.config.price_class;
    const users_class = data.config.users_class;
    const years_class = data.config.years_class;
    const selected_users = document.querySelector("." + users_class).value;
    const selected_years = document.querySelector("." + years_class).value;
    let default_link = '';
    
    if (document.querySelector('.' + buy_class)) {
      default_link = StoreProducts.appendVisitorID(document.querySelector('.' + buy_class).getAttribute('href'));
    }
    

    // missing params
    let buylink_vpn = ''
    let currency = 'USD'
    let save = ''
    let just_vpn = ''
    let new_price = '' 
    let ref = ''

    let pid_code = getParam('pid');
    if (pid_code) {
        pid_code = pid_code.split('_PGEN')[0];
    }
    const pid_urlBundle = '/pid.' + pid_code;
    
    let renew_lps = false;
    if (getParam('renew_lps') || (getParam('pid') && getParam('pid').toLowerCase().indexOf("renew") !== -1)) {
        renew_lps = true;
    }

    let checkbox_id = ''
    if (document.querySelector(".checkboxVPN-" + product_id)) {
      checkbox_id = document.querySelector(".checkboxVPN-" + product_id).getAttribute('data-id')
    }
    if (!$(".checkboxVPN-" + product_id).is(':checked')) {
      $('.' + show_vpn).hide();
      checkbox_id = $(this).attr('data-id')
    }
    
    if (document.querySelector(".checkboxVPN-" + product_id)) {
      document.querySelectorAll(".checkboxVPN-" + product_id).forEach(item => {
        item.addEventListener('click', function (e) {
          checkbox_id = e.target.getAttribute('data-id');
          changeHandler();
        });
      });
    }

    var changeHandler = function () {
        const product_vpn = 'vpn'

        const s_variation = StoreProducts.product[product_id].variations[selected_users][selected_years]
        const vb = StoreProducts.product[product_vpn].variations[10][1]

        const v = StoreProducts.getBundleProductsInfo(s_variation, vb)

        let updatedBuyLink = default_link
        let priceVpn = vb.price
        let full_price = ''

        if (document.getElementById(checkbox_id).checked) {
          document.querySelectorAll(".checkboxVPN-" + product_id).forEach(item => {
            if (!item.checked) {
              item.checked = true
            }
          })
          
          if (document.querySelector('.' + show_vpn)) {
            document.querySelector('.' + show_vpn).style.display = 'block';
          }
          if (document.querySelector('.' + savevpn_class)) {
            document.querySelector('.' + savevpn_class).style.display = 'block';
          }
          if (document.querySelector(".show_vpn-" + product_id)) {
            document.querySelector(".show_vpn-" + product_id).style.display = 'block';
          }
          
          //document.querySelector('.' + save_class).style.display = 'none';

            const links = new Object();
            const prices = new Object();
            let link_ref = '';

            if (product_id == 'av') {
                if (DEFAULT_LANGUAGE == 'uk') {
                    link_ref = 'WEBSITE_UK_AVBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'de') {
                    link_ref = 'WEBSITE_DE_AVBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'ro') {
                    link_ref = 'WEBSITE_RO_AVBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'es') {
                    link_ref = 'WEBSITE_ES_AVBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'fr') {
                    link_ref = 'WEBSITE_FR_AVBUNDLE';
                } else {
                    link_ref = 'WEBSITE_COM_AVBUNDLE';
                }
            }
            if (product_id == 'is') {
                if (DEFAULT_LANGUAGE == 'uk') {
                    link_ref = 'WEBSITE_UK_ISBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'de') {
                    link_ref = 'WEBSITE_DE_ISBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'ro') {
                    link_ref = 'WEBSITE_RO_ISBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'es') {
                    link_ref = 'WEBSITE_ES_ISBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'fr') {
                    link_ref = 'WEBSITE_FR_ISBUNDLE';
                } else {
                    link_ref = 'WEBSITE_COM_ISBUNDLE';
                }
            }
            if (product_id == 'tsmd') {
                if (DEFAULT_LANGUAGE == 'uk') {
                    link_ref = 'WEBSITE_UK_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'de') {
                    link_ref = 'WEBSITE_DE_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'ro') {
                    link_ref = 'WEBSITE_RO_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'es') {
                    link_ref = 'WEBSITE_ES_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'fr') {
                    link_ref = 'WEBSITE_FR_TSMULTIBUNDLE';
                } else {
                    link_ref = 'WEBSITE_COM_TSMULTIBUNDLE';
                }
            }
            if (product_id == 'fp') {
                if (DEFAULT_LANGUAGE == 'uk') {
                    link_ref = 'WEBSITE_UK_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'de') {
                    link_ref = 'WEBSITE_DE_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'ro') {
                    link_ref = 'WEBSITE_RO_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'es') {
                    link_ref = 'WEBSITE_ES_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'fr') {
                    link_ref = 'WEBSITE_FR_TSMULTIBUNDLE';
                } else {
                    link_ref = 'WEBSITE_COM_TSMULTIBUNDLE';
                }
            }
            if (product_id == 'soho') {
                if (DEFAULT_LANGUAGE == 'uk') {
                    link_ref = 'WEBSITE_UK_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'de') {
                    link_ref = 'WEBSITE_DE_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'ro') {
                    link_ref = 'WEBSITE_RO_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'es') {
                    link_ref = 'WEBSITE_ES_TSMULTIBUNDLE';
                } else if (DEFAULT_LANGUAGE == 'fr') {
                    link_ref = 'WEBSITE_FR_TSMULTIBUNDLE';
                } else {
                    link_ref = 'WEBSITE_COM_TSMULTIBUNDLE';
                }
            }

            if (link_ref.length > 0)
                ref = '/REF.' + link_ref;

            if (DEFAULT_LANGUAGE == 'au')
                currency = 'AUD';
            else
                currency = s_variation.currency_iso;

            if (renew_lps) {
                var coupon = {
                    '8': {
                        'USD': ['RENEW_UPGRADE_ADN2'],
                        'CAD': ['RENEW_UPGRADE_ADN2'],
                        'EUR': ['RENEW_UPGRADE_ADN'],
                        'ZAR': ['RENEW_UPGRADE_ADN'],
                        'MXN': ['RENEW_UPGRADE_ADN'],
                        'ALL': ['RENEW_UPGRADE_ADN']
                    },
                    '2': {
                        'USD': ['RENEW_UPGRADE_ADN2'],
                        'CAD': ['RENEW_UPGRADE_ADN2'],
                        'EUR': ['RENEW_UPGRADE_ADN'],
                        'ZAR': ['RENEW_UPGRADE_ADN'],
                        'MXN': ['RENEW_UPGRADE_ADN'],
                        'ALL': ['RENEW_UPGRADE_ADN']
                    },
                    '16': {
                        'USD': ['RENEW_UPGRADE_ADN'],
                        'CAD': ['RENEW_UPGRADE_ADN'],
                        'EUR': ['RENEW_UPGRADE_ADN'],
                        'ZAR': ['RENEW_UPGRADE_ADN'],
                        'MXN': ['RENEW_UPGRADE_ADN'],
                        'ALL': ['RENEW_UPGRADE_ADN']
                    },
                    '10': {
                        'CAD': ['RENEW_UPGRADE_ADN'],
                        'ALL': ['RENEW_UPGRADE_ADN']
                    },
                    '4': {
                        'AUD': ['RENEW_UPGRADE_ADN'],
                        'NZD': ['RENEW_UPGRADE_ADN']
                    },
                    '3': {
                        'GBP': ['RENEW_UPGRADE_ADN'],
                        'EUR': ['RENEW_UPGRADE_ADN']
                    },
                    '14': {
                        'EUR': ['RENEW_UPGRADE_ADN'],
                        'ALL': ['RENEW_UPGRADE_ADN']
                    },
                    '22': {
                        'EUR': ['RENEW_UPGRADE_ADN']
                    },
                    '9': {
                        'EUR': ['RENEW_UPGRADE_ADN']
                    },
                    '7': {
                        'EUR': ['RENEW_UPGRADE_ADN']
                    },
                    '6': {
                        'RON': ['RENEW_UPGRADE_ADN'],
                        'ALL': ['RENEW_UPGRADE_ADN']
                    },
                    '13': {'BRL': ['RENEW_UPGRADE_ADN']},
                    '5': {'EUR': ['63372958410'], 'CHF': ['63372958410']},
                    '12': {'EUR': ['RENEW_UPGRADE_ADN']},
                    '19': {
                        'ZAR': ['RENEW_UPGRADE_ADN']
                    },
                    '17': {'EUR': ['63372958410'], 'CHF': ['63372958410']},
                    '72': {
                        'JPY': ['RENEW_UPGRADE_ADN']
                    },
                    '26' : {
                        'SEK': ['RENEW_UPGRADE_ADN']
                    },
                    '28': {
                        'HUF': ['RENEW_UPGRADE_ADN']
                    },
                    '20': {
                        'MXN': ['RENEW_UPGRADE_ADN']
                    }
                };

            } else {
                var coupon = {
                    '8': {
                        'USD': ['VPN_XNA2'],
                        'CAD': ['VPN_XNA2'],
                        'EUR': ['VPN_XNA'],
                        'ZAR': ['VPN_XNA'],
                        'MXN': ['VPN_XNA'],
                        'ALL': ['VPN_XNA']
                    },
                    '2': {
                        'USD': ['VPN_XNA2'],
                        'CAD': ['VPN_XNA2'],
                        'EUR': ['VPN_XNA'],
                        'ZAR': ['VPN_XNA'],
                        'MXN': ['VPN_XNA'],
                        'ALL': ['VPN_XNA']
                    },
                    '16': {
                        'USD': ['VPN_XNA'],
                        'CAD': ['VPN_XNA'],
                        'EUR': ['VPN_XNA'],
                        'ZAR': ['VPN_XNA'],
                        'MXN': ['VPN_XNA'],
                        'ALL': ['VPN_XNA']
                    },
                    '10': {
                        'CAD': ['VPN_XNA'],
                        'ALL': ['VPN_XNA'],
                    },
                    '4': {
                        'AUD': ['VPN_XNA'],
                        'NZD': ['VPN_XNA']
                    },
                    '3': {
                        'GBP': ['VPN_XNA'],
                        'EUR': ['VPN_XNA']
                    },
                    '14': {
                        'EUR': ['VPN_XNA'],
                        'ALL': ['VPN_XNA'],
                    },
                    '22': {
                        'EUR': ['VPN_XNA']
                    },
                    '9': {
                        'EUR': ['VPN_XNA']
                    },
                    '7': {
                        'EUR': ['VPN_XNA']
                    },
                    '6': {
                        'RON': ['VPN_XNA'],
                        'ALL': ['VPN_XNA'],
                    },
                    '13': {'BRL': ['VPN_XNA']},
                    '5': {'EUR': ['63372958210'], 'CHF': ['63372958210']},
                    '12': {'EUR': ['VPN_XNA']},
                    '17': {'EUR': ['63372958210'], 'CHF': ['63372958210']},
                    '72': {'JPY': ['VPN_XNA']},
                    // alea multe
                    '11': {'INR': ['VPN_XNA']},
                    '23': {'KRW': ['VPN_XNA']},
                    '19': {'ZAR': ['VPN_XNA']},
                    '20': {'MXN': ['VPN_XNA']},
                    '21': {'MXN': ['VPN_XNA']},
                    '25': {'SGD': ['VPN_XNA']},
                    '26': {'SEK': ['VPN_XNA']},
                    '27': {'DKK': ['VPN_XNA']},
                    '28': {'HUF': ['VPN_XNA']},
                    '29': {'BGN': ['VPN_XNA']},
                    '31': {'NOK': ['VPN_XNA']},
                    '36': {'SAR': ['VPN_XNA']},
                    '38': {'AED': ['VPN_XNA']},
                    '39': {'ILS': ['VPN_XNA']},
                    '41': {'HKD': ['VPN_XNA']},
                    '46': {'PLN': ['VPN_XNA']},
                    '47': {'CZK': ['VPN_XNA']},
                    '49': {'TRY': ['VPN_XNA']},
                    '50': {'IDR': ['VPN_XNA']},
                    '51': {'PHP': ['VPN_XNA']},
                    '52': {'TWD': ['VPN_XNA']},
                    '54': {'CLP': ['VPN_XNA']},
                    '55': {'MYR': ['VPN_XNA']},
                    '57': {'PEN': ['VPN_XNA']},
                    '59': {'HRK': ['VPN_XNA']},
                    '66': {'THB': ['VPN_XNA']}
                };
            }


            if (DEFAULT_LANGUAGE == 'de') {
                if (typeof coupon[s_variation.region_id] !== 'undefined' && coupon[s_variation.region_id][currency] != 'undefined') {

                    buylink_vpn = StoreProducts.product[product_id].base_uri + '/Store/buybundle' + '/' + product_id + '/' + selected_users + '/' + selected_years + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + ref + pid_urlBundle + '/force.2';
                    buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/OfferID.' + coupon[s_variation.region_id][currency] + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
                    // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
                } else if (typeof coupon[s_variation.region_id] !== 'undefined' && coupon[s_variation.region_id]['ALL'] != 'undefined') {

                    buylink_vpn = StoreProducts.product[product_id].base_uri + '/Store/buybundle' + '/' + product_id + '/' + selected_users + '/' + selected_years + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + ref + pid_urlBundle + '/force.2';
                    buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/OfferID.' + coupon[s_variation.region_id]['ALL'] + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
                    // buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
                } else {
                    buylink_vpn = StoreProducts.product[product_id].base_uri + '/Store/buybundle' + '/' + product_id + '/' + selected_users + '/' + selected_years + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + ref + pid_urlBundle + '/force.2';
                    buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
                }

            } else {
                if (coupon[s_variation.region_id][currency] != 'undefined') {
                    buylink_vpn = StoreProducts.product[product_id].base_uri + '/Store/buybundle' + '/' + product_id + '/' + selected_users + '/' + selected_years + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + ref + pid_urlBundle + '/force.2';
                    buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/COUPON.' + coupon[s_variation.region_id][currency] + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
                    //buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
                } else if (coupon[s_variation.region_id]['ALL'] != 'undefined') {
                    buylink_vpn = StoreProducts.product[product_id].base_uri + '/Store/buybundle' + '/' + product_id + '/' + selected_users + '/' + selected_years + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + ref + pid_urlBundle + '/force.2';
                    buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/COUPON.' + coupon[s_variation.region_id]['ALL'] + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
                    //buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
                } else {
                    buylink_vpn = StoreProducts.product[product_id].base_uri + '/Store/buybundle' + '/' + product_id + '/' + selected_users + '/' + selected_years + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + ref + pid_urlBundle + '/force.2';
                    buylink_vpn += '/' + product_vpn + '/' + 10 + '/' + 1 + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + '/CURRENCY.' + currency + '/DCURRENCY.' + currency;
                }
            }

            if (data.selected_variation.discount && vb.discount) {
                
              full_price = Math.round((parseFloat(data.selected_variation.price) + parseFloat(priceVpn)) * 100) / 100;
              priceVpn = Math.round((parseFloat(data.selected_variation.discount.discounted_price) + parseFloat(vb.discount.discounted_price)) * 100) / 100;
              save = Math.round(parseFloat(full_price) - parseFloat(priceVpn));
              just_vpn = parseFloat(vb.discount.discounted_price.replace("$", "").replace("â‚¬", "").replace("Â£", "").replace("R$", "").replace("AUD", ""));

          } else if (vb.discount) {

              full_price = Math.round((parseFloat(data.selected_variation.price) + parseFloat(vb.price)) * 100) / 100;
              priceVpn = Math.round((parseFloat(data.selected_variation.price) + parseFloat(vb.discount.discounted_price)) * 100) / 100;
              save = Math.round(parseFloat(full_price) - parseFloat(priceVpn));
              just_vpn = parseFloat(vb.discount.discounted_price.replace("$", "").replace("â‚¬", "").replace("Â£", "").replace("R$", "").replace("AUD", ""));
              if (document.querySelector('.show_save_' + data.config.product_id)) {
                document.querySelector('.show_save_' + data.config.product_id).style.display = 'block'
              }

          } else {

              just_vpn = parseFloat(vb.price.replace("$", "").replace("â‚¬", "").replace("Â£", "").replace("R$", "").replace("AUD", ""));
              full_price = Math.round((parseFloat(data.selected_variation.price) + parseFloat(just_vpn)) * 100) / 100;
              save = Math.round(parseFloat(full_price) - parseFloat(priceVpn));
              if (data.selected_variation.discount) {
                  priceVpn = Math.round((parseFloat(data.selected_variation.discount.discounted_price) + just_vpn) * 100) / 100;

              } else {
                  priceVpn = Math.round((parseFloat(data.selected_variation.price) + just_vpn) * 100) / 100;
              }

          }

            priceVpn = StoreProducts.formatPrice(priceVpn, s_variation['currency_label'], s_variation['region_id'], s_variation['currency_iso']);
            just_vpn = StoreProducts.formatPrice(just_vpn, s_variation['currency_label'], s_variation['region_id'], s_variation['currency_iso']);

            if (data.selected_variation.discount) {
                full_price = StoreProducts.formatPrice(full_price, s_variation['currency_label'], s_variation['region_id'], s_variation['currency_iso']);
            }

            save = StoreProducts.formatPrice(save, s_variation['currency_label'], s_variation['region_id'], s_variation['currency_iso']);

            updatedBuyLink = buylink_vpn

            if (document.querySelector("." + disc_price_class)) {
              document.querySelectorAll("." + disc_price_class).forEach(item => {
                item.innerHTML = priceVpn;
              })
            }

            if (document.querySelector(".price_vpn-" + product_id)) {
              document.querySelector(".price_vpn-" + product_id).innerHTML = just_vpn;
            }

        } else { // not checked
          document.querySelectorAll(".checkboxVPN-" + product_id).forEach(item => {
            if (item.checked) {
              item.checked = false;
            }
          })

          if (document.querySelector("." + show_vpn)) {
            document.querySelector('.' + show_vpn).style.display = 'none';
          }
          if (document.querySelector(".show_vpn-" + product_id)) {
            document.querySelector(".show_vpn-" + product_id).style.display = 'none';
          }

          if (data.selected_variation.discount) {
              full_price = Math.round(parseFloat(data.selected_variation.price) * 100) / 100;
              new_price = Math.round(parseFloat(data.selected_variation.discount.discounted_price) * 100) / 100;
              save = Math.round(parseFloat(full_price) - parseFloat(new_price));
              if (document.querySelector('.show_save_' + data.config.product_id)) {
                document.querySelector('.show_save_' + data.config.product_id).style.display = 'block';
              }
              
          } else {
              full_price = Math.round(parseFloat(data.selected_variation.price) * 100) / 100;
              new_price = full_price;
              save = 0;
              if (document.querySelector('.show_save_' + data.config.product_id)) {
                document.querySelector('.show_save_' + data.config.product_id).style.display = 'none';
              }
          }

          buylink_vpn = StoreProducts.product[product_id].base_uri + '/Store/buybundle' + '/' + product_id + '/' + selected_users + '/' + selected_years + '/platform.' + s_variation.platform_id + '/region.' + s_variation.region_id + ref + buylink_vpn + '/force.2';

          full_price = StoreProducts.formatPrice(full_price, s_variation['currency_label'], s_variation['region_id'], s_variation['currency_iso']);
          save = StoreProducts.formatPrice(save, s_variation['currency_label'], s_variation['region_id'], s_variation['currency_iso']);
          new_price = StoreProducts.formatPrice(new_price, s_variation['currency_label'], s_variation['region_id'], s_variation['currency_iso']);

          if (document.querySelector("." + buy_class)) {
            document.querySelectorAll("." + disc_price_class).forEach(item => {
              item.setAttribute('href', default_link);
            })
          }
      
          if (document.querySelector("." + disc_price_class)) {
            document.querySelectorAll("." + disc_price_class).forEach(item => {
              item.innerHTML = new_price;
            })
          }
        }

        if (document.querySelector("." + buy_class)) {
          document.querySelectorAll("." + buy_class).forEach(item => {
            item.setAttribute('href', StoreProducts.appendVisitorID(updatedBuyLink));
          })
        }

        if (full_price != '' && document.querySelector("." + price_class)) {
          document.querySelectorAll("." + price_class).forEach(item => {
            item.innerHTML = full_price;
          })
        }

        if (full_price != '' && document.querySelector(".old" + price_class)) {
          document.querySelectorAll(".old" + price_class).forEach(item => {
            item.innerHTML = full_price;
          })
        }

        if (document.querySelector("." + save_class)) {
          document.querySelectorAll("." + save_class).forEach(item => {
            item.innerHTML = save;
          })
        }

    };
}

const initSelectors = () => {
  if (productsList.length > 0) {
    const fakeSelectors_bottom = document.createElement('div');
    fakeSelectors_bottom.id = 'fakeSelectors_bottom';
    document.querySelector("footer").before(fakeSelectors_bottom);
    
    productsList.map((prod, idx) => {
      const prodSplit = prod.split('/');
      const prodAlias = productAliases(prodSplit[0].trim());
      const prodUsers = prodSplit[1].trim();
      const prodYears = prodSplit[2].trim();

      fakeSelectors_bottom.innerHTML += "<label>Fake Devices for " + prodAlias + ": </label>";
      const createSelectForDevices = document.createElement('select');
      createSelectForDevices.className = "users_" + prodAlias + "_fake";
      document.getElementById("fakeSelectors_bottom").append(createSelectForDevices);

      fakeSelectors_bottom.innerHTML += "<label>Fake Years for " + prodAlias + ": </label>";
      const createSelectForYears = document.createElement('select');
      createSelectForYears.className = "years_" + prodAlias + "_fake";
      document.getElementById("fakeSelectors_bottom").append(createSelectForYears);

      StoreProducts.initSelector({
        product_id: prodAlias,
        full_price_class: "oldprice-" + prodAlias,
        discounted_price_class: "newprice-" + prodAlias,
        price_class: "price-" + prodAlias,
        buy_class: "buylink-" + prodAlias,
        selected_users: prodUsers,
        selected_years: prodYears,
        users_class: "users_" + prodAlias + "_fake",
        years_class: "years_" + prodAlias + "_fake",
        extra_params: { pid: getParam('pid') },
  
        onSelectorLoad: function () {
          try {
            let fp = this;
            if (prodAlias === 'vpn') {
              showPriceVPN(fp);
            } else {
              addVpnBD(fp, 'show_vpn_' + prodAlias);
              showPrice(fp);
            }
            
          } catch (ex) {
            console.log(ex);
          }
        },
      });

    })

    document.querySelectorAll('.checkboxVPN').forEach((checkbox, idx) => {
      checkbox.id += idx + 1
      checkbox.setAttribute('data-id', checkbox.id)
    })
  }
}

const loadPage = async () => {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
  initSelectors();

  // adding IDs on each section
  document.querySelectorAll("main .section > div:first-of-type").forEach((item, idx) => {
    const getIdentity = item.className
    item.parentElement.id = getIdentity + "-" + ++idx
  })
}

/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
const initMobileDetector = viewport => {
  const mobileDetectorDiv = document.createElement('div');
  mobileDetectorDiv.setAttribute(`data-${viewport}-detector`, '');
  document.body.prepend(mobileDetectorDiv);
}

/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
export const isView = viewport => {
  const element = document.querySelectorAll(`[data-${viewport}-detector]`)[0];
  return !!(element && getComputedStyle(element).display !== 'none');
}

// add new script file
const addScript = src => {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');

    s.setAttribute('src', src);
    s.addEventListener('load', resolve);
    s.addEventListener('error', reject);

    document.body.appendChild(s);
  });
}

function initBaseUri() {
  const domainName = 'bitdefender';
  const domainExtension = window.location.hostname.split('.').pop(); // com | ro | other

  window.BASE_URI = ['com', 'ro'].includes(domainExtension) ? `${window.location.protocol}//www.${domainName}.${domainExtension}/site` : `${window.location.protocol}//www.${domainName}.com/site`;
}

initMobileDetector('mobile');
initMobileDetector('tablet');
initMobileDetector('desktop');

initBaseUri();

loadPage();

await addScript('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js');
await addScript('https://www.bitdefender.com/scripts/Store2015.min.js');
// todo optimize bundle size
await addScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js');
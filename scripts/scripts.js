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

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
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
function buildAutoBlocks(main) {
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
export function decorateMain(main) {
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
async function loadEager(doc) {
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
export function addFavIcon(href) {
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
async function loadLazy(doc) {
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
function loadDelayed() {
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

  console.log(document.querySelector(parent))
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

// add showDiscoutOrFullPrice
export function showDiscoutOrFullPrice(storeObj) {

  var currency_label = storeObj.selected_variation.currency_label;
  var region_id = storeObj.selected_variation.region_id;

  var productName = '';
  switch (storeObj.config.product_id) {
      case 'av':
          var productName = 'av';
          break;
      case 'is':
          var productName = 'is';
          break;
      case 'tsmd':
          var productName = 'tsmd';
          break;
      case 'tsvpn':
          var productName = 'tsvpn';
          break;
      case 'fp':
          var productName = 'fp';
          break;
      case 'soho':
          var productName = 'soho';
          break;
      case 'bus-security':
          var productName = 'bus-security';
          break;
      case 'bus_bundle':
          var productName = 'bus_bundle';
          break;
      case 'elite_1000':
          var productName = 'elite_1000';
          break;
  }

  if (currency_label !== '$') {
      $('.products3.lp-cl-campaign.v2019 .buybox .new-price').css("font-size", "1.8em");
      $('.comparison2018.lp2019 .redBtn').css("max-width", "15em");
  }

  if (typeof storeObj.selected_variation.discount === "object") {
      var full_price = StoreProducts.formatPrice(storeObj.selected_variation.price, currency_label, region_id);
      var offer_price = StoreProducts.formatPrice(storeObj.selected_variation.discount.discounted_price, currency_label, region_id);
      var savings_price = storeObj.selected_variation.price - storeObj.selected_variation.discount.discounted_price;
      var savings = StoreProducts.formatPrice(savings_price.toFixed(0), currency_label, region_id);
      // var percentage_sticker = (((storeObj.selected_variation.price - storeObj.selected_variation.discount.discounted_price) * 100) / storeObj.selected_variation.price).toFixed(0);
      var percentage_sticker = (((storeObj.selected_variation.price - storeObj.selected_variation.discount.discounted_price) / storeObj.selected_variation.price) * 100).toFixed(0);
      // console.log(percentage_sticker);

      $('.oldprice-' + productName).show().html(full_price);
      $('.newprice-' + productName).html(offer_price);
      $('.save-' + productName).css('visibility', 'visible').html(savings);
      $('.percent-' + productName).css('visibility', 'visible').html(percentage_sticker + '%');
      // $('.bulina-' + productName).css('visibility', 'visible');
      $('.show_save_' + productName).show();
  } else {
      var full_price = StoreProducts.formatPrice(storeObj.selected_variation.price, currency_label, region_id);
      $('.newprice-' + productName).html(full_price);
      $('.oldprice-' + productName).hide();
      $('.save-' + productName).html("0").parent().siblings('div').css({
          'visibility': 'hidden',
          'display': 'none'
      });
      $('.percent-' + productName).parent().css({ 'visibility': 'hidden', 'display': 'none' });
      $('.oldprice-' + productName + ', .save-' + productName).closest('.info-row').css({ 'display': 'none' });
      $('.show_save_' + productName).hide();
      // $('.bulina-' + productName).parent().css({'visibility': 'hidden'});
  }
}



async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

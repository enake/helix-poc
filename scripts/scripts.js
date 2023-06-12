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

// append to DOM specific element
export const appendDomElement = (parent, content) => {
  if (typeof parent === 'undefined' &&  parent === '') {
    parent = 'main';
  }

  console.log(content);
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


async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
function initMobileDetector(viewport) {
  const mobileDetectorDiv = document.createElement('div');
  mobileDetectorDiv.setAttribute(`data-${viewport}-detector`, '');
  document.body.prepend(mobileDetectorDiv);
}

function addScript(src, callback) {
  const s = document.createElement('script');
  s.setAttribute('src', src);
  s.setAttribute('type', 'module');
  s.onload = callback;
  document.body.appendChild(s);
}

/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
export function isView(viewport) {
  const element = document.querySelectorAll(`[data-${viewport}-detector]`)[0];
  return !!(element && getComputedStyle(element).display !== 'none');
}

addScript('./scripts/utils.js');

initMobileDetector('mobile');
initMobileDetector('tablet');
initMobileDetector('desktop');

loadPage();

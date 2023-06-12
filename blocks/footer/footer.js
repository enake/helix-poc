/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
// eslint-disable-next-line no-unused-vars
import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
//   const cfg = readBlockConfig(block);
//   block.textContent = '';
//
//   // fetch footer content
//   const footerPath = cfg.footer || '/footer';
//   console.log(footerPath);
//   const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});
// console.log(resp);
//   if (resp.ok) {
//     const html = await resp.text();
//
//     // decorate footer DOM
//     const footer = document.createElement('div');
//     footer.innerHTML = html;
//
//     decorateIcons(footer);
//     block.append(footer);
//   }
}

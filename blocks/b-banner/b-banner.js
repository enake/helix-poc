/* 
  Informations: 
  - hero banner - top LandingPage
  - default value for discount: 10%

  MetaDatas:
  - discount_style : default(circle) || pill
  - product : ex: elite/10/1 (alias_name/nr_devices/nr_years)
  - discount_text : ex: OFF special offer (comes after the percent discount) ((not necessary for default discount_style))

  Samples:
  - default(circle): https://www.bitdefender.com/media/html/business/cross-sell-flash-sale-pm-2023/existing.html
  - pill: https://www.bitdefender.com/media/html/business/RansomwareTrial/new.html
*/

import { updateProductsList, productAliases } from "../../scripts/scripts.js";

export default function decorate(block) {
  // get data attributes set in metaDatas
  const parentSelector = block.closest('.section');
  const metaDatas = parentSelector.dataset;
  // console.log(metaDatas);

  // move picture below
  const bannerImage = block.querySelector('picture');
  parentSelector.append(bannerImage);

  // config new elements
  const paragraph = block.querySelector('p');
  const { product, discountStyle, discountText } = metaDatas;
  if (typeof product !== 'undefined' && product !== '') {
    const prodConfig = product;
    const prodSplit = prodConfig.split('/');
    const prodName = productAliases(prodSplit[0]);

    updateProductsList(prodConfig);

    let discount_style = 'circle'; // default value
    if (typeof discountStyle !== 'undefined' && discountStyle !== 'default') {
      discount_style = discountStyle;
    }

    let discount_text = ''; // default value
    if (typeof discountText !== 'undefined' && discountText !== 'default') {
      discount_text = discountText;
    }
    const percentRadius = ` <span class="prod-percent strong green_bck_${discount_style} mx-2"><span class="percent-${prodName}">10%</span> ${discount_text}</span>`;
    paragraph.innerHTML += percentRadius;
  }

}

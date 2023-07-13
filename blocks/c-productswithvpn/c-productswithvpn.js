/*
  Information:
  - displays 3 boxes positioned in flex mode:
    1. product 1
    2. product 2
    3. product 3

  MetaData:
  - background : ex: grey (background-color of full section)
  - products : ex: tsmd/5/1, is/3/1, av/3/1 (alias_name/nr_devices/nr_years)
  - tag_text: ex: BEST BANG FOR YOUR BUCK!
  - tag_text2: ex: PREMIUM SECURITY AND PRIVACY PACK
  - tag_text3: ex: BEST BANG FOR YOUR BUCK!
  - bulina_text: ex: UP TO
                        0% OFF
                      SALE TODAY

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/last-offer.html - http://localhost:3000/consumer/en/new/last-offer
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/ultimate-flv1.html - http://localhost:3000/consumer/en/new/ultimate-flv1
*/

import { updateProductsList, productAliases } from '../../scripts/scripts.js';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const {
    title,
    subtitle,
    titlePosition,
    products,
    bulinaText,
    borderColor,
    checkmarkType,
  } = metaData;
  const productsAsList = products && products.split(',');

  if (productsAsList.length) {
    /// ///////////////////////////////////////////////////////////////////////
    // set the title
    if (typeof title !== 'undefined') {
      const divTagTitle = document.createElement('div');
      divTagTitle.classList = `top_title ${typeof titlePosition !== 'undefined' ? `p_${titlePosition}` : ''}`;

      // adding title
      divTagTitle.innerHTML = document.querySelectorAll('h1').length === 0 ? `<h1>${title}</h1>` : `<h2>${title}</h2>`;

      // adding subtitle
      if (typeof subtitle !== 'undefined') {
        divTagTitle.innerHTML += `<h2>${subtitle}</h2>`;
      }

      block.parentNode.prepend(divTagTitle);
    }

    /// ///////////////////////////////////////////////////////////////////////
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    // add VPN
    updateProductsList('vpn/10/1');

    /// ///////////////////////////////////////////////////////////////////////
    // set top class with numbers of products
    parentSelector.classList.add(`has${productsAsList.length}boxes`);

    /// ///////////////////////////////////////////////////////////////////////
    // create procent - bulina
    if (typeof bulinaText !== 'undefined') {
      const bulinaSplitted = bulinaText.split(',');
      let divBulina = `<div class='prod-percent green_bck_circle bigger has${bulinaSplitted.length}txt'>`;
      bulinaSplitted.forEach((item, idx) => {
        let newItem = item;
        if (item.indexOf('0%') !== -1) {
          newItem = item.replace(/0%/g, '<b class=\'max-discount\'></b>');
        }
        divBulina += `<span class='bulina_text${idx + 1}'>${newItem}</span>`;
      });
      divBulina += '</div>';

      // add to the previous element
      if (block.parentNode.querySelector('.top_title')) {
        block.parentNode.querySelector('.top_title').innerHTML += divBulina;
      } else {
        block.parentNode.parentNode.previousElementSibling.innerHTML += divBulina;
      }
    }

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((item, idx) => {
      const prodName = productAliases(productsAsList[idx].split('/')[0]);

      const pricesDiv = document.createElement('div');
      pricesDiv.className = 'prices_box';
      pricesDiv.innerHTML += `<span class="prod-oldprice oldprice-${prodName}"></span>`;
      pricesDiv.innerHTML += `<span class="prod-newprice newprice-${prodName}"></span>`;

      block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table`).after(pricesDiv);

      /// ///////////////////////////////////////////////////////////////////////
      // adding top tag to each box
      let tagTextKey = `tagText${idx}`;
      if (idx === 0) {
        tagTextKey = 'tagText';
      }
      if (metaData[tagTextKey]) {
        const divTag = document.createElement('div');
        divTag.innerText = metaData[tagTextKey];
        divTag.className = 'green_tag';
        block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) p:nth-child(1)`).before(divTag);
      }

      /// ///////////////////////////////////////////////////////////////////////
      // add buybtn div & anchor
      const tableVpn = block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:nth-of-type(2)`);
      const tableBuybtn = block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:nth-of-type(3) td`);

      const aBuybtn = document.createElement('a');
      aBuybtn.innerHTML = tableBuybtn.innerHTML.replace(/0%/g, `<span class="percent percent-${prodName}"></span>`);
      aBuybtn.className = `red-buy-button buylink-${prodName}`;
      aBuybtn.setAttribute('title', 'Buy Now Bitdefender');

      const divBuybtn = document.createElement('div');
      divBuybtn.className = 'buybtn_box';

      tableVpn.after(divBuybtn);
      divBuybtn.appendChild(aBuybtn);

      /// ///////////////////////////////////////////////////////////////////////
      let hasVPN = false;
      if (tableVpn.innerText.indexOf('X') !== -1 && tableVpn.innerText.indexOf('Y') !== -1 && tableVpn.innerText.indexOf('Z') !== -1) {
        hasVPN = true;
      }

      // adding input vpn
      if (hasVPN) { // has VPN
        // table_vpn.className = 'vpn_box'
        // replace in vpn box
        const replaceData = {
          X: '<span class="newprice-vpn"></span>',
          Y: '<span class="oldprice-vpn"></span>',
          Z: '<span class="percent-vpn"></span>',
        };

        let labelId = `checkboxVPN-${prodName}`;
        if (document.getElementById(labelId)) {
          labelId = `${labelId}-1`;
        }
        let vpnContent = `<input id="${labelId}" class="${labelId} checkboxVPN" type="checkbox" value="">`;
        vpnContent += `<label for="${labelId}">`;
        tableVpn.querySelectorAll('td').forEach((td) => {
          vpnContent += `<span>${td.innerHTML.replace(/[XYZ]/g, (m) => replaceData[m])}</span>`;
        });
        vpnContent += '</label>';

        const vpnBox = document.createElement('div');
        vpnBox.className = 'vpn_box';
        vpnBox.innerHTML = `<div>${vpnContent}</div>`;

        tableVpn.before(vpnBox);
        tableVpn.remove();
      } else { // no VPN
        // if we don't have vpn we need to set a min-height for the text that comes in place of it
        parentSelector.classList.contains('table_fixed_h');
        if (!parentSelector.classList.contains('table_fixed_h')) {
          parentSelector.classList.add('table_fixed_h');
        }
      }

      // removing last table
      block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:last-of-type`).remove();

      // add prod class on block
      block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1})`).classList.add(`${prodName}_box`, 'prod_box');
    });

    // change border color of the primary product
    if (typeof borderColor !== 'undefined') {
      const border = document.querySelector('.c-productswithvpn > div:nth-child(1)');
      border.style.borderColor = borderColor;
      const tag = document.querySelector('.c-productswithvpn > div div.green_tag');
      tag.style.backgroundColor = borderColor;
    }

    // change border color of the primary product
    if (typeof checkmarkType !== 'undefined') {
      const listElements = block.querySelectorAll('.c-productswithvpn > div ul li ');

      if (checkmarkType === 'full_circle') {
        listElements.forEach((listElement) => {
          listElement.classList.add('check-full');
        });
      }
    }
  }
}

/*
  Information:
  - displays 3 boxes positioned in flex mode:
    1. product 1
    2. product 2
    3. product 3

  MetaData:
  - background : ex: grey (background-color of full section)
  - products : ex: tsmd/5/1, is/3/1, av/3/1 (alias_name/nr_devices/nr_years)
  - bulina_text: ex: 0% OFF
                      discount

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer-opt/ - http://localhost:3000/consumer/en/new/cl-offer-opt
*/

import { productAliases } from '../../scripts/scripts.js';
import { updateProductsList } from '../../scripts/utils.js';

export default function decorate(block) {
  /// ///////////////////////////////////////////////////////////////////////
  // get data attributes set in metaData
  const parentSelector = block.closest('.section');
  const metaData = parentSelector.dataset;
  const { products, bulinaText } = metaData;
  const productsAsList = products && products.split(',');

  if (productsAsList.length) {
    // check and add products into the final array
    productsAsList.forEach((prod) => updateProductsList(prod));

    // add VPN
    updateProductsList('vpn/10/1');

    /// ///////////////////////////////////////////////////////////////////////
    // set top class with numbers of products
    parentSelector.classList.add(`has${productsAsList.length}boxes`);

    /// ///////////////////////////////////////////////////////////////////////
    // create prices sections
    productsAsList.forEach((product, idx) => {
      const prodName = productAliases(productsAsList[idx].split('/')[0]);

      // adding prices
      const pricesSections = block.querySelectorAll(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:first-of-type p`);
      // old price:
      pricesSections[0].innerHTML += `<span class='prod-oldprice oldprice-${prodName}'></span>`;
      // vpn:
      pricesSections[1].classList.add(`show_vpn_${prodName}`);
      pricesSections[1].style.display = 'none';
      pricesSections[1].innerHTML += '<i><span class="prod-oldprice oldprice-vpn"></span><span class="prod-newprice newprice-vpn"></span>';
      // new price:
      pricesSections[2].innerHTML += `<span class='prod-save save-${prodName}'></span>`;
      // total:
      pricesSections[3].innerHTML += `<span class='prod-newprice newprice-${prodName}'></span>`;

      // adding top tag to each box
      // create procent - bulina
      if (typeof bulinaText !== 'undefined') {
        const bulinaSplitted = bulinaText.split(',');
        let divBulina = `<div class="prod-percent green_bck_circle medium bulina-${prodName} has${bulinaSplitted.length}txt">`;
        bulinaSplitted.forEach((item, key) => {
          let newItem = item;
          if (item.indexOf('0%') !== -1) {
            newItem = item.replace(/0%/g, `<b class='percent-${prodName}'></b>`);
          }
          divBulina += `<span class="bulina_text${key + 1}">${newItem}</span>`;
        });
        divBulina += '</div>';

        // add to the previous element
        block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) p:nth-child(1)`).innerHTML += divBulina;
      }

      /// ///////////////////////////////////////////////////////////////////////
      // add buybtn div & anchor
      const tableBuybtn = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:nth-of-type(2) td`);
      tableBuybtn.innerHTML = `<a href='#' title='Bitdefender ${prodName}' class='red-buy-button buylink-${prodName}'>${tableBuybtn.innerText}</a>`;

      /// ///////////////////////////////////////////////////////////////////////
      // adding vpn input checkbox
      const tableVpn = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:nth-of-type(3)`);
      const vpnPrices = '<b><span class="prod-oldprice oldprice-vpn">$0</span><span class="prod-newprice newprice-vpn">$0</span></b>';
      const vpnDiv = document.createElement('div');
      vpnDiv.className = 'vpn_box';

      let labelId = `checkboxVPN-${prodName}`;
      if (document.getElementById(labelId)) {
        labelId = `${labelId}-1`;
      }
      let vpnContent = `<input id='${labelId}' class='${labelId} checkboxVPN' type='checkbox' value=''>`;
      vpnContent += `<label for='${labelId}'>${tableVpn.querySelector('td').innerHTML.replace(/0/g, vpnPrices)}</label>`;

      vpnDiv.innerHTML = vpnContent;

      tableVpn.before(vpnDiv);
      tableVpn.remove();
      // add prod class on block
      block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1})`).classList.add(`${prodName}_box`, 'prod_box');
    });
  }
}

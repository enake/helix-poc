/* eslint-disable linebreak-style */
/* eslint-disable */

/*
  Informations: 
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

import { updateProductsList, productAliases } from "../../scripts/scripts.js";

export default function decorate(block) {
    //////////////////////////////////////////////////////////////////////////
    // get data attributes set in metaData
    const parentSelector = block.closest('.section')
    const metaData = parentSelector.dataset;
    const { products, bulinaText } = metaData;
    const productsAsList = products.split(',')


    if (productsAsList.length) {
      // get first prod from the list
      const firstProd = productsAsList[0].split('/')[0]

      // check and add products into the final array
      productsAsList.forEach(prod => updateProductsList(prod));

      // add VPN
      updateProductsList('vpn/10/1')

      //////////////////////////////////////////////////////////////////////////
      // set top class with numbers of products
      parentSelector.classList.add(`has${productsAsList.length}boxes`)


      //////////////////////////////////////////////////////////////////////////
      // create prices sections
      productsAsList.forEach((item, idx) => {
        const prodName = productAliases(productsAsList[idx].split('/')[0])

        // adding prices
        const prices_sections = block.querySelectorAll(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:first-of-type p`)
        // old price:
        prices_sections[0].innerHTML += `<span class="prod-oldprice oldprice-${prodName}"></span>`
        // vpn:
        prices_sections[1].classList.add(`show_vpn_${prodName}`)
        prices_sections[1].innerHTML += '<i><span class="prod-oldprice oldprice-vpn"></span><span class="prod-newprice newprice-vpn"></span>'
        // new price:
        prices_sections[2].innerHTML += `<span class="prod-save save-${prodName}"></span>`
        // total:
        prices_sections[3].innerHTML += `<span class="prod-newprice newprice-${prodName}"></span>`

      
        // adding top tag to each box
        // create procent - bulina
        if (typeof bulinaText !== 'undefined') {
          const bulina_splitted = bulinaText.split(',')
          let divBulina = `<div class="prod-percent green_bck_circle medium bulina-${prodName} has${bulina_splitted.length}txt">`
          bulina_splitted.forEach((item, idx) => {
            if (item.indexOf('0%') !== -1) {
              item = item.replace(/0%/g, `<b class="percent-${prodName}"></b>`)
            }
            divBulina += `<span class="bulina_text${idx + 1}">${item}</span>`
            
          })
          divBulina += `</div>`

          // add to the previous element
          block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) p:nth-child(1)`).innerHTML += divBulina
        }
        

        //////////////////////////////////////////////////////////////////////////
        // add buybtn div & anchor
        const table_buybtn = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:nth-of-type(2) td`)
        const a_buybtn = `<a href="#" title="Bitdefender ${prodName}" class="red-buy-button buylink-${prodName}">${table_buybtn.innerText}</a>`
        table_buybtn.innerHTML = a_buybtn


        //////////////////////////////////////////////////////////////////////////
        // adding vpn input checkbox
        const table_vpn = block.querySelector(`.c-productswithvpn2 > div:nth-child(${idx + 1}) table:nth-of-type(3)`)
        const vpn_prices = `<b><span class="prod-oldprice oldprice-${prodName}">$69.99</span><span class="prod-newprice newprice-${prodName}">$69.99</span></b>`
        let vpn_div = document.createElement('div')
        vpn_div.className = 'vpn_box'

        let vpn_content = `<input id="checkboxVPN-${prodName}" class="checkboxVPN-${prodName} checkboxVPN" type="checkbox" value="">`
        vpn_content += `<label for="checkboxVPN-${prodName}${idx + 1}">${table_vpn.querySelector('td').innerHTML.replace(/0/g, vpn_prices)}</label>`

        vpn_div.innerHTML = vpn_content

        table_vpn.before(vpn_div)
        table_vpn.remove()

    
      });
      
    }
}

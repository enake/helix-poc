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
  - tag_text: ex: BEST BANG FOR YOUR BUCK!

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/last-offer.html
*/

import { updateProductsList, productAliases } from "../../scripts/scripts.js";

export default function decorate(block) {
    //////////////////////////////////////////////////////////////////////////
    // get data attributes set in metaData
    const parentSelector = block.closest('.section');
    const metaData = parentSelector.dataset;
    const { products, tagText, bulinaText1, bulinaText2 } = metaData;

    const productsAsList = products.split(',');

    if (productsAsList.length) {
      //////////////////////////////////////////////////////////////////////////
      // check and add products into the final array
      productsAsList.forEach(prod => updateProductsList(prod));

      // add VPN
      updateProductsList('vpn/10/1')
      

      //////////////////////////////////////////////////////////////////////////
      // create procent - bulina
      const firstProd = productsAsList[0].split('/')[0]
      const divBulina = `<div class="prod-percent green_bck_circle bigger bulina-${firstProd}">
        <span class="bulina_text1"><b class="percent-${firstProd}"></b> ${bulinaText1}</span>
        <span class="bulina_text2">${bulinaText2}</span>
      </div>`

      // add to the previous element
      document.querySelectorAll('.c-productswithvpn-container').forEach((item) => {
        item.previousElementSibling.innerHTML += divBulina
      })
      
      //////////////////////////////////////////////////////////////////////////
      // create prices sections
      productsAsList.forEach((item, idx) => {
        const prodName = productAliases(productsAsList[idx].split('/')[0])
        const pricesDiv = document.createElement("div")
        pricesDiv.className = 'prices_box'
        pricesDiv.innerHTML += '<span class="prod-oldprice oldprice-' + prodName +'"></span>'
        pricesDiv.innerHTML += '<span class="prod-newprice newprice-' + prodName +'"></span>'
  
        block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table`).after(pricesDiv)

        //////////////////////////////////////////////////////////////////////////
        // replace in vpn box
        const replace_data = {
          'X': '<span class="newprice-vpn"></span>',
          'Y': '<span class="oldprice-vpn"></span>',
          'Z': '<span class="percent-vpn"></span>'
        };

        let table_vpn = block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:nth-of-type(2)`)

        //////////////////////////////////////////////////////////////////////////
        // adding input vpn
        const input_checkbox = `<input id="checkboxVPN-${prodName}" class="checkboxVPN-${prodName} checkboxVPN" type="checkbox" value="">`
        
        table_vpn.innerHTML = input_checkbox + table_vpn.innerHTML.replace(/[XYZ]/g, m => replace_data[m])

        //////////////////////////////////////////////////////////////////////////
        // add buybtn div & anchor
        let table_buybtn = block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:nth-of-type(3) td`)
        
        const a_buybtn = document.createElement('a')
        a_buybtn.innerHTML = table_buybtn.innerHTML.replace(/0%/g, '<span class="percent-' + prodName +'"></span>')
        a_buybtn.className = 'red-buy-button buylink-' + prodName
        a_buybtn.setAttribute('title', 'Buy Now Bitdefender')
 
        const div_buybtn = document.createElement('div')
        div_buybtn.className = 'buybtn_box'
        
        table_vpn.after(div_buybtn)
        div_buybtn.appendChild(a_buybtn)

        //////////////////////////////////////////////////////////////////////////
        // addEventListener on each VPN table to trigger checkbox input
        block.querySelectorAll(`.c-productswithvpn > div:nth-child(${idx + 1}) table:nth-of-type(2)`).forEach(item => {
          item.addEventListener('click', () => {
            item.querySelector('input').click()
          })
        })
        
        block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:last-of-type`).remove()
        
      });

      //////////////////////////////////////////////////////////////////////////
      // adding top tag to the 1st box
      const div_tag = document.createElement('div');
      div_tag.innerText = tagText;
      div_tag.className = 'green_tag';
      block.querySelector('.c-productswithvpn > div:nth-child(1) p:nth-child(1)').before(div_tag)
    }
}

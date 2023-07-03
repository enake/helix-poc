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
  - tag_text2: ex: PREMIUM SECURITY AND PRIVACY PACK
  - tag_text3: ex: BEST BANG FOR YOUR BUCK!
  - bulina_text: ex: UP TO
                        0% OFF
                      SALE TODAY


  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/last-offer.html - http://localhost:3000/consumer/en/new/last-offer
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/ultimate-flv1.html - http://localhost:3000/consumer/en/new/ultimate-flv1
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
      // create procent - bulina
      if (bulinaText) {
        const bulina_splitted = bulinaText.split(',')
        let divBulina = `<div class="prod-percent green_bck_circle bigger bulina-${firstProd} has${bulina_splitted.length}txt">`
        bulina_splitted.forEach((item, idx) => {
          if (item.indexOf('0%') !== -1) {
            item = item.replace(/0%/g, '<b class="percent-' + firstProd +'"></b>')
          }
          divBulina += `<span class="bulina_text${idx + 1}">${item}</span>`
          
        })
        divBulina += `</div>`

        // add to the previous element
        block.parentNode.parentNode.previousElementSibling.innerHTML += divBulina
      }

 
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
        // adding top tag to each box
        let tagTextKey = `tagText${idx}`;
        if (idx == 0) {
          tagTextKey = `tagText`;
        }
        if (metaData[tagTextKey]) {
          const div_tag = document.createElement('div');
          div_tag.innerText = metaData[tagTextKey];
          div_tag.className = 'green_tag';
          block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) p:nth-child(1)`).before(div_tag)
        }
        

        //////////////////////////////////////////////////////////////////////////
        // add buybtn div & anchor
        let table_vpn = block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:nth-of-type(2)`)
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
        let hasVPN = false;
        if (table_vpn.innerText.indexOf('X') !== -1 && table_vpn.innerText.indexOf('Y') !== -1 && table_vpn.innerText.indexOf('Z') !== -1) {
          hasVPN = true;
        }
        
        // adding input vpn
        if (hasVPN) { // has VPN
            //table_vpn.className = 'vpn_box'
            // replace in vpn box
            const replace_data = {
              'X': '<span class="newprice-vpn"></span>',
              'Y': '<span class="oldprice-vpn"></span>',
              'Z': '<span class="percent-vpn"></span>'
            };

            const vpn_prices = `<b><span class="prod-oldprice oldprice-${prodName}">$69.99</span><span class="prod-newprice newprice-${prodName}">$69.99</span></b>`
            let vpn_div = document.createElement('div')
            vpn_div.className = 'vpn_box'

            let vpn_content = `<input id="checkboxVPN-${prodName}" class="checkboxVPN-${prodName} checkboxVPN" type="checkbox" value="">`
            vpn_content += `<label for="checkboxVPN-${prodName}${idx + 1}">`
            table_vpn.querySelectorAll('td').forEach(item => {
              vpn_content += `<span>${item.innerHTML.replace(/[XYZ]/g, m => replace_data[m])}</span>`
            })
            vpn_content += '</label>'

            vpn_div.innerHTML = vpn_content

            table_vpn.before(vpn_div)
            table_vpn.remove()

        } else { // no VPN
          // if we don't have vpn we need to set a min-height for the text that comes in place of it
          parentSelector.classList.contains('table_fixed_h')
          if (!parentSelector.classList.contains('table_fixed_h')) {
            parentSelector.classList.add('table_fixed_h')
          }
          
        }

        block.querySelector(`.c-productswithvpn > div:nth-child(${idx + 1}) table:last-of-type`).remove()
        
      });
      
    }
}
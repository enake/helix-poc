/* eslint-disable linebreak-style */
/* eslint-disable */

/*
  Informations: 
  - displays 4 boxes positioned in flex mode:
    0. top text
    1. left text
    2. product 1
    3. product 2
    4. product 3

  MetaData:
  - background : ex: grey (background-color of full section)
  - products : ex: tsmd/5/1, is/3/1, av/3/1 (alias_name/nr_devices/nr_years)
  - top_text : ex: COMPARE SOLUTIONS
                   Compare Bitdefender Products


  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer-opt/ - http://localhost:3000/consumer/en/new/cl-offer-opt
*/

import { updateProductsList, productAliases } from "../../scripts/scripts.js";

export default function decorate(block) {
    //////////////////////////////////////////////////////////////////////////
    // get data attributes set in metaData
    const parentSelector = block.closest('.section')
    const metaData = parentSelector.dataset;
    const { products, topText } = metaData;
    const productsAsList = products.split(',')

    //////////////////////////////////////////////////////////////////////////
    // adding top text
    if (typeof topText !== 'undefined') {
      const topText_splitted = topText.split(',')
      let top_header = document.createElement('div');
      top_header.className = 'topHeader col-12'
      top_header.innerHTML += `<h3 class="heading">${topText_splitted[0]}</h3>`
      top_header.innerHTML += `<h2 class="subheading">${topText_splitted[1]}</h2>`
      block.parentNode.prepend(top_header)
    }


    if (productsAsList.length) {
      // get first prod from the list
      const firstProd = productsAsList[0].split('/')[0]

      // check and add products into the final array
      productsAsList.forEach(prod => updateProductsList(prod));


      //////////////////////////////////////////////////////////////////////////
      // set top class with numbers of products
      parentSelector.classList.add(`has${productsAsList.length}boxes`)


      //////////////////////////////////////////////////////////////////////////
      // create prices sections
      productsAsList.forEach((item, idx) => {

        // add prices
        const prodName = productAliases(productsAsList[idx].split('/')[0])
        const prices_section = block.querySelector(`div:nth-child(${++idx + 1}) table:first-of-type`)
        let pricesDiv = '<div class="prices_box">';
        pricesDiv += '<span class="prod-oldprice oldprice-' + prodName +'"></span>'
        pricesDiv += '<span class="prod-newprice newprice-' + prodName +'"></span>'
        pricesDiv += '<div>'
        prices_section.innerHTML = pricesDiv
      

        // add buybtn div & anchor
        const table_buybtn = block.querySelector(`div:nth-child(${idx + 1}) table:last-of-type td`)
        const a_buybtn = `<a href="#" title="Bitdefender ${prodName}" class="red-buy-button buylink-${prodName}">${table_buybtn.innerText}</a>`
        table_buybtn.innerHTML = a_buybtn


      });
      
    }
}

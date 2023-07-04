/**
 * Information:
 * - this product is MANDATORY to be added once on the end of each page
 * - Loads selectors for each product - that is takes from buylinks configurations
 * - is displayed none, by default
 *
 * Parameters:
 * - none
 *
 * Attributes to consider:
 * - for Prices:
 * [type|alias_class extra_classes|default_value] - [price|newprice-elite|$570.49]
 * - for Percent:
 * [type|alias_class extra_classeses|default_value|extra_text] - [percent|percent-elite_100 green_txt|30%|
 * - for BuyLinks - Buttons: [type|alias_class|default_value] - [buylink|buylink-bus-security|10-1|BUY NOW] - MANDATORY: default_value
 * - for go2link - Buttons:  [type|classes|block_name|default_value] - [go2link|red-buy-button|B-ProductsWithSelectors|GET THE OFFER NOW]
 * - for Selectors:          [type|label_name|alias_class|intervalMIn-intervalMax|default_value] - [selector|devices|selector_devices|1-100|10]
 */

import { splitLastOccurrence, addScript } from '../../scripts/scripts.js';

export default function decorate() {
  const aliasNamesList = [];
  const allPs = document.querySelectorAll('p');

  [].forEach.call(allPs, (item) => {
    // we search for filters
    if (item.innerHTML.indexOf('[') !== -1 && item.innerHTML.indexOf(']') !== -1 && item.innerText.indexOf('|') !== -1) {
      const initialText = item.innerText.replace('[', '').replace(']', '');
      const itemSplit = initialText.split('|');

      const isPrice = item.innerText.indexOf('price') !== -1;
      if (isPrice) {
        const className = itemSplit[1];
        const classNameSplit = className.split('-')[0];
        const valueName = itemSplit[2];
        item.innerHTML = `<span class="prod-${classNameSplit} ${className}">${valueName}</span>`;
      }

      const isPercent = item.innerText.indexOf('percent') !== -1;
      if (isPercent) {
        const classList = itemSplit[1];
        const [aliasClassName, extraClassName] = splitLastOccurrence(classList, ' ');

        const valueName = itemSplit[2];
        const extraText = itemSplit[3];
        item.innerHTML = `<div class="prod-percent ${extraClassName}"><span class="${aliasClassName}">${valueName}</span> ${extraText}</div>`;
      }

      const isBuylink = item.innerText.indexOf('buylink') !== -1;
      if (isBuylink) {
        const className = itemSplit[1];

        const aliasName = className.split(/-(.*)/s)[1];
        const valueVariations = itemSplit[2].split('-');
        if (aliasNamesList.indexOf(aliasName) === -1) {
          aliasNamesList.push(`${aliasName}/${valueVariations[0]}/${valueVariations[1]}`);
        }

        const classNameSplit = className.split('-')[0];
        const valueName = itemSplit[3];
        item.innerHTML = `<a class="red-buy-button prod-${classNameSplit} ${className}" href="#" title="Bitdefender">${valueName}</a>`;
      }

      const isGoToLink = item.innerText.indexOf('go2link') !== -1;
      if (isGoToLink) {
        const className = itemSplit[1];
        const go2block = itemSplit[2].toLowerCase();
        const valueName = itemSplit[3];

        item.innerHTML = `<button class="${className}" data-go2block="${go2block}" title="Bitdefender">${valueName}</button>`;
        item.innerHTML = item.innerHTML.replace(initialText, '');
      }

      const isSelector = item.innerText.indexOf('selector') !== -1;
      if (isSelector) {
        const labelName = itemSplit[1];
        const uppercaseLabelName = labelName.charAt(0).toUpperCase() + labelName.slice(1);

        const interval = itemSplit[3].split('-');
        const intervalMin = Number(interval[0]);
        const intervalMax = Number(interval[1]);

        const selectedValue = itemSplit[4];
        let option = '';

        for (let i = intervalMin; i <= intervalMax; i += 1) {
          const selected = Number(selectedValue) === i ? ' selected' : '';
          option += `<option value='${i}'${selected}>${i} ${uppercaseLabelName}</option>`;
        }

        item.innerHTML = `<div class="selectorBox"><label>${labelName}</label> <select id="select-${labelName}">${option}</select></div>`;
      }
    }
  });/* end forEach */

  if (document.querySelectorAll('*[data-go2block]').length > 0) {
    document.querySelectorAll('*[data-go2block]').forEach((item) => {
      item.addEventListener('click', () => {
        const go2block = item.getAttribute('data-go2block');
        document.querySelector(`.${go2block}`).scrollIntoView();
      });
    });
  }

  // if we have products on page
  if (aliasNamesList.length > 0) {
    // addEventListener to all selectorBox:
    if (document.querySelectorAll('.selectorBox')) {
      document.querySelectorAll('.selectorBox').forEach((selectorBoxEl) => {
        selectorBoxEl.addEventListener('change', (e) => {
          if (e.target.id === 'select-devices') {
            [].forEach.call(aliasNamesList, (item) => {
              const prodAlias = item.split('/')[0];
              if (document.querySelector(`.users_${prodAlias}_fake`)) {
                const userFakeSelector = document.querySelector(`.users_${prodAlias}_fake`);
                userFakeSelector.value = e.target.value;
                userFakeSelector.dispatchEvent(new Event('change'));
              }
            });
          }
          if (e.target.id === 'select-years') {
            [].forEach.call(aliasNamesList, (item) => {
              const prodAlias = item.split('/')[0];
              if (document.querySelector(`.years_${prodAlias}_fake`)) {
                const yearFakeSelector = document.querySelector(`.years_${prodAlias}_fake`);
                yearFakeSelector.value = e.target.value;
                yearFakeSelector.dispatchEvent(new Event('change'));
              }
            });
          }
        });
      });
    }

    // adding necessary scripts
    addScript('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js');
    // addScript('https://www.bitdefender.com/themes/draco/scripts/lite_v2/main.js');
    addScript('https://www.bitdefender.com/scripts/Store2015.min.js');

    setTimeout(() => {
      // Load initSelector if we find any products used
      [].forEach.call(aliasNamesList, (item) => {
        const itemSplitted = item.split('/');
        const prodAlias = itemSplitted[0];
        const prodUsers = itemSplitted[1];
        const prodYears = itemSplitted[2];

        const fakeSelectParent = document.querySelector('.b-loadselectors');

        // create fake USERS label + selector
        const fakeLabelUsers = document.createElement('label');
        fakeLabelUsers.innerText = `Devices: ${prodAlias}`;
        const fakeSelectUsers = document.createElement('select');
        fakeSelectUsers.className = `users_${prodAlias}_fake`;

        // create fake YEARS label + selector
        const fakeLabelYears = document.createElement('label');
        fakeLabelYears.innerText = `Years: ${prodAlias}`;
        const fakeSelectYears = document.createElement('select');
        fakeSelectYears.className = `years_${prodAlias}_fake`;

        fakeSelectParent.appendChild(fakeLabelUsers);
        fakeSelectParent.appendChild(fakeSelectUsers);

        fakeSelectParent.appendChild(fakeLabelYears);
        fakeSelectParent.appendChild(fakeSelectYears);

        StoreProducts.initSelector({
          product_id: prodAlias,
          full_price_class: `oldprice-${prodAlias}`,
          discounted_price_class: `newprice-${prodAlias}`,
          price_class: `price-${prodAlias}`,
          buy_class: `buylink-${prodAlias}`,
          selected_users: prodUsers,
          selected_years: prodYears,
          users_class: `users_${prodAlias}_fake`,
          years_class: `years_${prodAlias}_fake`,

          // extra_params: { pid: pid_code },

          onSelectorLoad() {
            // try {
            //   const fp = this;
            //   showDiscoutOrFullPrice(fp);
            // } catch (ex) {}
          },
          onChangeUsers() {
          },
        });
      });/* end forEach initSelector */
    }, 1000);
  }
}

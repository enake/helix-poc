/* 
  Informations: 
  - displaies 3 boxes positioned in flex mode: 
    1. selectors
    2. product 1
    3. product 3

  Parameters:
  - none

  Attributes to consider:
  - for Prices:             [type|alias_class extra_classes|default_value] - [price|newprice-elite|$570.49]
  - for Percent:            [type|alias_class extra_classeses|default_value|extra_text] - [percent|percent-elite_100 green_txt|30%|
  - for BuyLinks - Buttons: [type|alias_class|default_value] - [buylink|buylink-bus-security|10-1|BUY NOW] - MANDATORY: default_value
  - for go2link - Buttons:  [type|classes|block_name|default_value] - [go2link|red-buy-button|B-ProductsWithSelectors|GET THE OFFER NOW]
  - for Selectors:          [type|label_name|alias_class|intervalMIn-intervalMax|default_value] - [selector|devices|selector_devices|1-100|10]
*/

export default function decorate(block) {
    console.log('here: ',block);

  /*[...block.children].forEach((row, k) => {
    console.log("row ",row);
  });*/

}

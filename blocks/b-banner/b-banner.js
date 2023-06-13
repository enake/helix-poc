import { cleanBlockDOM,  createDomElement, appendDomElement, addAttr2DomElement } from "../../scripts/scripts.js";

export default function decorate(block) {
  //console.log(block);

  [...block.children].forEach((row) => {
    //console.log(row);
    const img_banner_href = row.querySelector('img').getAttribute('src');
    document.querySelector('.b-banner-container').setAttribute('style', "background-image: url("+ img_banner_href +")");
    row.querySelector('picture').remove();
  });

}

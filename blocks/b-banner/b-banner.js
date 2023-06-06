import { cleanBlockDOM,  createDomElement, appendDomElement, addAttr2DomElement } from "../../scripts/scripts.js";

export default function decorate(block) {
  //console.log(block);

  cleanBlockDOM('.b-banner-container');
  
  createDomElement('.b-banner-container', 'section', 'heroBanner', '', '', {});
  createDomElement('#heroBanner', 'div', '', 'container', '', {});

  [...block.children].forEach((row) => {
    //console.log(row);

    const img_banner_href = row.querySelector('img').getAttribute('src');
    if (typeof img_banner_href !== 'undefined') {
      addAttr2DomElement('style', `background-image: url("${img_banner_href}")`, '#heroBanner');
    }

    const h1 = row.querySelector('h1');
    appendDomElement('.container', h1);

    const h2 = row.querySelector('h2');
    appendDomElement('.container', h2);

    const paragraph = row.querySelector('p');
    appendDomElement('.container', paragraph);
  });

}

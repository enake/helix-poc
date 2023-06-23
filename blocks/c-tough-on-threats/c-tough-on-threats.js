/* eslint-disable linebreak-style */
/* eslint-disable */
import ReviewComponent from '/components/review/review.js';

/*
  Information:

  MetaData:
  - textstyle : default(center) || left || right
  - bottomtext : free text input ( optional )

  Samples:
  - https://www.bitdefender.com/media/html/consumer/new/2020/cl-offer1-opt/ultimate-flv1.html
*/
export default function decorate(block) {
  console.log('c-threats', block);
  const columns = [...block.children[0].children];

  block.innerHTML = `
    <div class="container py-5">
      <div class="row">
        <div class="col-12 col-md-7 order-last order-md-first">${ columns[0].innerHTML }</div>
        <div class="col-8 col-md-5 d-flex justify-content-center align-items-center mb-md-0 mb-4 mx-auto">
          ${ columns[1].innerHTML }
        </div>
      </div>
    </div>
  `;
}

/* eslint-disable linebreak-style */
/* eslint-disable */
import ReviewComponent from '/components/review/review.js';

export default function decorate(block) {
  // const [firstCol, pictureCol] = Array.from(block.firstElementChild.children);

  block.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col-12">
          ${ new ReviewComponent(3, 'Message 1', 'Al pacino').render() }
        </div>
      </div>
    </div>
  `;
}

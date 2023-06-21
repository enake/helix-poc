/* eslint-disable linebreak-style */
/* eslint-disable */
import ColumnComponent from '/components/column/column.js';

export default function decorate(block) {
  console.log('columns-bd', block);
  const [firstCol, pictureCol] = Array.from(block.firstElementChild.children);

  block.innerHTML = `
    <div class="container">
      <div class="row g-0">
        <div class="col-12 col-md-6">
          ${ new ColumnComponent(firstCol, 'secondary').render() }
        </div>
        <div class="col-12 col-md-6">
          ${ pictureCol.innerHTML }
        </div>
      </div>
    </div>
  `;
}

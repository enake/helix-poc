/* eslint-disable linebreak-style */
/* eslint-disable */
import ColumnComponent from '/components/column/column.js';

export default function decorate(block) {
    console.log('columns-two', block);
    const columns = [...block.children[0].children];

    block.innerHTML = `
        <div class="container">
          <div class="row">
            ${ columns.map(col => `
                <div class="col-12 col-md-6">
                  ${ new ColumnComponent(col).render() }
                </div>`)
            .join('') }
          </div>
        </div>
    `;
}
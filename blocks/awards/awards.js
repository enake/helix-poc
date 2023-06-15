/* eslint-disable linebreak-style */
/* eslint-disable */

export default function decorate(block) {
    const columns = [...block.children[0].children];

    block.innerHTML = `
        <div class="container">
          <div class="row">
            ${columns.map(col => `<div class="col-12 col-md-4">
              <div class="text-center">
                <div class="mb-2">${col.children[0].innerHTML}</div>
                <div class="title mb-2">${col.children[1].innerText}</div>
                <div class="subtitle mb-2">${col.children[2].innerText}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>
    `;
}
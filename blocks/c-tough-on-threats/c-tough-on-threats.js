export default function decorate(block) {
  const [richTextEl, pictureEl] = [...block.children[0].children];

  block.innerHTML = `
    <div class="container py-5">
      <div class="row">
        <div class="col-12 col-md-7 order-last order-md-first">${richTextEl.innerHTML}</div>
        <div class="col-8 col-md-5 d-flex justify-content-center align-items-center mb-md-0 mb-4 mx-auto">
          ${pictureEl.innerHTML}
        </div>
      </div>
    </div>
  `;
}

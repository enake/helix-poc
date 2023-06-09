import isView from '../../scripts/utils.js';

export default function decorate(block) {
  const [quoteElement, authorElement, positionElement] = block.children;
  let isDesktopView = isView('desktop');

  render();

  function render() {
    block.innerHTML = `
    <div class="main-wrapper">
      <div class="inner-wrapper">
        <div class="container">
          <div>
            <q>${quoteElement.innerText}</q>
            <div class="separator"></div>
            <div class="author">${authorElement.innerText}</div>
            <span class="position">${positionElement.innerText}</span>
          </div>
        </div>
      </div>
      ${isDesktopView ? '<img alt="" src="https://www.bitdefender.com/media/html/business/cross-sell-flash-sale-pm-2023/images/testimonialsBG_1920X558.jpg" />' : ''}
    </div>`;

    const ref = document.querySelector('.b-bottomteaser-container .main-wrapper');

    const resizeObserver = new ResizeObserver(() => {
      const newViewportView = isView('desktop');

      const viewHasChanged = isDesktopView !== newViewportView;

      if (viewHasChanged) {
        isDesktopView = newViewportView;

        render();
      }
    });

    resizeObserver.observe(ref);
  }
}

/*
  Information:
  - the tab is open by default
  - [add-on] - will be treated as green tag

  Parameters:
  - (closed) : for tab to be closed by default
*/

export default function decorate(block) {
  // search for [] to replace with span greeenTag class
  const getFirstDivs = block.querySelectorAll('.b-dropdownbox-container .block > div > div:nth-child(1)');
  getFirstDivs.forEach((item) => {
    item.innerHTML = item.innerHTML.replace('[', '<span class="greenTag">');
    item.innerHTML = item.innerHTML.replace(']', '</span>');
  });

  // make slideUp slideDown functionality
  const getFirstTabs = block.querySelectorAll('.b-dropdownbox-container .block > div:first-child');
  getFirstTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tab.parentNode.classList.toggle('inactive');
    });
  });

  // if 3rd div does not exists => has 2 elements
  if (!block.querySelector('.b-dropdownbox-container .block > div > div:nth-child(3)')) {
    block.classList.add('has2divs');
  }
}

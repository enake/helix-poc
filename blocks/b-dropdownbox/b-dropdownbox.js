/* 
  Informations: 
  - the tab is open by default
  - [add-on] - will be treated as green tag

  Parameters:
  - (closed) : for tab to be closed by default
*/

export default function decorate(block) {
  // console.log('here: ',block);

  // search for [] to replace with span greeenTag class
  let getFirstDivs = document.querySelectorAll('.b-dropdownbox-container .block > div > div:nth-child(1)');
  [].forEach.call(getFirstDivs, function(item) {
    item.innerHTML = item.innerHTML.replace("[", '<span class="greenTag">');
    item.innerHTML = item.innerHTML.replace("]", '</span>');
  });

  // make slideUp slideDown functionality
  let getFirstTabs = document.querySelectorAll('.b-dropdownbox-container .block > div:first-child');
  [].forEach.call(getFirstTabs, function(tab) {
    tab.addEventListener("click", function() {
      tab.parentNode.classList.toggle("inactive")
    });
  });


  /*[...block.children].forEach((row, k) => {
    // console.log("row ",row);
  });*/

}

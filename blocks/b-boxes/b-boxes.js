export default function decorate(block) {
  // console.log('here: ',block);
  //cleanBlockDOM('.b-boxes-container');

  const extra_classes = block.classList[1];
  document.querySelector('.b-boxes-container').classList.add(extra_classes);
  document.querySelector('.b-boxes').classList.remove('blue-gradient');
  document.querySelector('.b-boxes-container').setAttribute("id", "blockSection");
  document.querySelector('.b-boxes-wrapper').classList.add('container');

  [...block.children].forEach((row, k) => {
    // console.log("row ",row);
  });

}

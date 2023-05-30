/* eslint-disable linebreak-style */
/* eslint-disable */

export default function decorate(block) {

    let images = block.querySelectorAll("img");
    for (var i = 0; i < images.length; i++) {
        images[i].style.height = "100px";
    }
}
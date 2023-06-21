/* eslint-disable linebreak-style */
/* eslint-disable */

export default class ReviewComponent {
  #rating;
  #quote;
  #author

  /*
  * @rating {Number} start number rating
  * @quote {String} quote string
  * @author {String} author string
  * */
  constructor(rating, message, author) {
    this.#rating = rating;
    this.#quote = message;
    this.#author = author;
  }

  #renderSvgStars() {
    return `
      ${ Array.from(Array(this.#rating).keys()).map(item => `
        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star" class="svg-inline--fa fa-star fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"> <path fill="currentColor" d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
      `).join('') }
    `;
  }

  render() {
    return `
      <review-component>
        <div class="">
          <div class="d-flex">
            ${ this.#renderSvgStars() }
          </div>
          <div class="separator"></div>
          <q>${ this.#quote }</q>
          <div class="separator"></div>
          <div class="author">${ this.#author }</div>
        </div>
      </review-component>
    `;
  }
}
/* eslint-disable linebreak-style */
function createContainer() {
  const container = document.createElement('div');
  container.classList = 'tw-flex tw-my-10 tw-bg-[#F5F5F7] tw-rounded-3xl';
  return container;
}

function createTextContainer() {
  const textContainer = document.createElement('div');
  textContainer.classList = 'md:tw-w-1/2 tw-px-8 md:tw-px-7 lg:tw-px-8 tw-pb-24 tw-pt-16 md:tw-pt-12 md:tw-pb-16';
  return textContainer;
}

function handleImageColumn(picWrapper, newContainer) {
  picWrapper.classList.add('columns-bd-img-col');
  picWrapper.classList += ' tw-hidden md:tw-block tw-w-1/2 tw-relative tw-rounded-3xl';
  picWrapper.querySelector('picture > img').classList = 'tw-h-full';
  const pic = picWrapper.querySelector('picture');
  pic.classList = 'tw-block tw-w-full tw-h-full tw-object-cover tw-object-center tw-rounded-r-3xl';

  const noPicMobile = document.createElement('div');
  noPicMobile.classList = 'tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-[#ffffff] tw-via-[#F5F5F700] tw-to-[#00000000] tw-opacity-50';
  picWrapper.appendChild(noPicMobile);
  newContainer.appendChild(picWrapper);
}

function handleContentColumn(col, textContainer) {
  const title = col.querySelector('h3').innerText;

  col.querySelector('p:nth-child(1) > picture > img').classList = 'tw-h-16 tw-mb-4';
  col.querySelector('p:nth-child(1) > picture > img').style = 'width: fit-content';
  const topPicture = col.querySelector('p:nth-child(1)').innerHTML;

  const awardsPictures = document.createElement('div');
  col.querySelectorAll('p:not(:nth-child(1)) > picture').forEach((picture) => {
    picture.querySelector('img').classList.add('tw-h-14');
    awardsPictures.appendChild(picture);
  });

  const description = col.querySelectorAll('p')[1].innerText;
  const buttonText = col.querySelectorAll('p')[3].innerText;
  const buttonHref = col.querySelectorAll('p')[3].firstElementChild.getAttribute('href');

  col.innerHTML = `
    ${topPicture}
    <h3 class="tw-text-3xl tw-font-bold tw-mb-8">${title}</h3>
    <p class="tw-mb-8">${description}</p>
    <div class="tw-flex tw-items-center tw-space-x-4 tw-mb-8"> 
      ${awardsPictures.innerHTML}
    </div>
    <a href="${buttonHref}" class="tw-uppercase tw-font-bold tw-block tw-border-solid tw-rounded-lg tw-py-3 tw-px-2 tw-text-center tw-border-2 tw-w-full tw-text-sm tw-border-custom-red tw-bg-custom-red hover:tw-bg-red-700 hover:tw-border-red-700 tw-text-white tw-w-1/2 tw-group">
      <span>${buttonText}</span> 
      <svg xmlns="http://www.w3.org/2000/svg" class="tw-hidden tw-w-3 tw-h-3 tw-ml-3 group-hover:tw-inline-block" viewBox="0 0 384 512">
        <path fill="white" d="M192 0L352 160v32H240l0 320L0 512V416H144l0-224H32V160L192 0z"></path>
      </svg>
    </a>
  `;
  textContainer.appendChild(col);
}

export default function decorate(block) {
  const cols = Array.from(block.firstElementChild.children);
  block.classList.add(`columns-bd-${cols.length}-cols`);

  const newContainer = createContainer();
  const textContainer = createTextContainer();
  newContainer.appendChild(textContainer);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          handleImageColumn(picWrapper, newContainer);
        } else {
          handleContentColumn(col, textContainer);
        }
      }
    });
  });

  block.appendChild(newContainer);
}

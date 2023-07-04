import { loadFragment } from '../../scripts/scripts.js';

export default async function decorate(block) {
  // TODO: investigate what's the deal with fragments
  const fragment = await loadFragment('/footer');
  const footer = block.closest('.footer-wrapper');

  if (fragment) {
    const fragmentSections = fragment.querySelectorAll(':scope .section');
    if (fragmentSections) {
      footer.replaceChildren(...fragmentSections);
    }
  }

  footer.innerHTML = footer.innerHTML.replace('[year]', new Date().getFullYear());
}

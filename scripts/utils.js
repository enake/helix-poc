/*
* @viewport: 'mobile' | 'tablet' | 'desktop'
* */
export default function isView(viewport) {
  const element = document.querySelectorAll(`[data-${viewport}-detector]`)[0];
  return !!(element && getComputedStyle(element).display !== 'none');
}
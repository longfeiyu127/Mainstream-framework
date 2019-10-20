export function isUndef (v) {
  return v === undefined || v === null
}

export function isDef (v){
  return v !== undefined && v !== null
}

export function isFun (v){
  return typeof v === 'function' 
}

export function nodeToFragment(el) {
  const fragment = document.createDocumentFragment();
  let child = el.firstChild;
  while (child) {
    fragment.appendChild(child);
    child = el.firstChild
  }
  return fragment;
}

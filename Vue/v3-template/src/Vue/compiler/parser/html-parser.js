import { nodeToFragment } from "../../util";
export default function parseHTML(template) {
  const box = document.createElement('div')
  box.innerHTML = template
  const fragment = nodeToFragment(box);
  return fragment
}

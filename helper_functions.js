/**
* Helper function to create a button with the specified text and click event handler.
* @param text The text for the button.
* @param onClick The click event handler for the button.
* @returns The button.
*/
function createButton(text, onClick) {
 const b = document.createElement("button");
 b.setAttribute("type", "button");
 b.appendChild(document.createTextNode(text));
 if (onClick) {
   b.addEventListener("click", onClick);
 }
 return b;
};

/**
 * Helper function to facilitate HTMLElement creation.
 * @param element An object describing the element to create.
 */
function createElement(element) {
  const e = document.createElement(element.type);
  if (element.text) {
    e.appendChild(document.createTextNode(element.text));
  }
  if (element.attributes) {
    for (const attributePair of element.attributes) {
      e.setAttribute(attributePair[0], attributePair[1]);
    }
  }
  if (element.children) {
    for (const child of element.children) {
      if (child) {
        e.appendChild(child);
      }
    }
  }
  return e;
};
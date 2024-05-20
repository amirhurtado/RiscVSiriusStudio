export function getDrawComponent(document, attribute, value) {
  // The property must be unique!
  const g = document.querySelectorAll(`[data-${attribute}="${value}"]`)[0];
  return g;
}

/**
 *
 * @param {element} element on which the properties will be applied
 * @param {properties} properties to apply
 *
 * TODO: Test whether the property is supported by the element.
 */
export function applyElementProperties(element, properties) {
  for (var key in properties) {
    setAttribute(element, key, properties[key]);
  }
}

export function applyCSSProperties(element, properties) {
  for (var key in properties) {
    //console.log("Applying CSS property ", key);
    element.style[key] = properties[key];
  }
}

export function setAttribute(component, attribute, value) {
  component.setAttributeNS(null, attribute, value);
}

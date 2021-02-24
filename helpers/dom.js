export const jsSelector = (string, findAll) => {
  const body = window.document.body;
  if(findAll) {
    const a = body.querySelectorAll(`.js-${string}`);
    if(a) {
      return Array.from(a);
    }
    return a;
  }
  return body.querySelector(`.js-${string}`);
}

export const docBodySelector = (string, findAll) => {
  const body = window.document.body;
  if(findAll) {
    const a = body.querySelectorAll(string);
    if(a) {
      return Array.from(a);
    }
    return a;
  }
  return body.querySelector(string);
}

export const scrollToEl = ({el, block = 'center'}) => {
  el.scrollIntoView({
    behavior: 'smooth',
    block,
  });
}

export const jsSelector = (string, findAll) => {
  const body = window.document.body;
  if(findAll) {
    return body.querySelectorAll(`js-${string}`);
  }
  body.querySelector(`js-${string}`);
}

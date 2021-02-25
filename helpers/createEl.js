const createEl = ({
  elName = 'div',
  className,
  value,
  type,
  innerHTML,
  onclick,
  onchange,
  datasets = [],
  appendInnerHTML,
}) => {
  const el = document.createElement(elName);
  if(className) el.className = className;
  if(type) el.type = type;
  if(value) el.value = value;
  if(innerHTML) el.innerHTML = innerHTML;
  if(onclick) el.onclick = onclick;
  if(onchange) el.onchange = onchange;
  if(appendInnerHTML) el.append(appendInnerHTML);
  if(datasets.length) {
    datasets.forEach(dataset => {
      el.dataset[dataset.name] = dataset.value;
    });
  }

  return el;
}

export default createEl;

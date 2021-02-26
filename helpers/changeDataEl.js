const changeDataEl = ({
  className,
  byQuery,
  byEl,
  innerHTML,
  value,
  removeClass,
  datasets = [],
  deleteDataSets = [],
  addClass,
  forEl,
}) => {
  const changeFields = (el) => {
    if(innerHTML) el.innerHTML = innerHTML;
    if(value) el.value = value;
    if(className) el.className = className;
    if(removeClass) el.classList.remove(removeClass);
    if(addClass) el.classList.add(addClass);
    if(datasets.length) {
      datasets.forEach(newDataSet => {
        el.dataset[newDataSet.name] = newDataSet.value;
      });
    }
    if(deleteDataSets.length) {
      deleteDataSets.forEach(newDataSet => {
        delete el.dataset[newDataSet.name];
      });
    }

    return el;
  }

  if(forEl) {
    return changeFields(forEl);
  }

  if(byEl) {
    const el = byEl.querySelector(byQuery);
    return changeFields(el);
  }

  const el = byQuery.querySelector(byQuery);
  return changeFields(el);
}

export default changeDataEl;

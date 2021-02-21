function delay({time = 100, name, func}) {
  if(this[name]) {
    clearTimeout(this[name]);
  }

  this[name] = setTimeout(() => func(), time);
}

export default delay;

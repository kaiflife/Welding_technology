const styles = ['modal', 'button', 'catalog'];

styles.forEach(item => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = `styles/${item}.css`;
  document.getElementsByTagName('HEAD')[0].append(link);
})
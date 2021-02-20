export default class Modal {
  constructor(
    {
      headerEls,
      mainEls,
      footerEls,
      modalClassesName = '',
      openModal,
      closeModal,
    }
  ) {
    this.modalClassesName = modalClassesName;
    this.isOpened = false;
    this.modalEl = null;

    this.innerSkeletonEls = {headerEls, mainEls, footerEls};

    if(openModal) this.openModal = openModal;
    if(closeModal) this.closeModal = closeModal;
  }

  createModal() {
    const skeleton = ['header', 'main', 'footer'];
    const modalEl = document.createElement('div');
    modalEl.className = `modal js-modal ${this.modalClassesName}`;

    skeleton.forEach(elName => {
      const innerEls = this.innerSkeletonEls[`${elName}Els`];

      //if have no els then continue
      if(!(Array.isArray(innerEls) && innerEls.length)) return;

      const newEl = document.createElement('div');
      newEl.className = `modal-${elName}`;

      innerEls.forEach(innerEl => {
        newEl.append(innerEl);
      });

      modalEl.append(newEl);
    });

    document.body.append(modalEl);

    this.modalEl = modalEl;
  }

  openModal() {
    this.isOpened = true;

    this.createModal();
    this.initListeners();
  }

  closeModal() {
    this.isOpened = false;

    this.modalEl.remove();

    document.body.removeEventListener('keydown', this.escapeModal);
  }

  escapeModal = (e) => {
    const { key } = e;
    if(this.isOpened && key === 'Escape') {
      this.closeModal();
    }
  };

  initListeners() {
    document.body.addEventListener('keydown', this.escapeModal);
  }
}

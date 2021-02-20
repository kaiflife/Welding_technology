const skeleton = ['header', 'main', 'footer'];

export default class Modal {
  constructor(
    {
      headerEls,
      mainEls,
      footerEls,
      modalClassesName = '',
      openModal,
      closeModal,
      enterEventName,
    }
  ) {
    this.modalClassesName = modalClassesName;
    this.isOpened = false;
    this.modalEl = null;
    this.enterEventName = enterEventName;

    this.outsideFuncs = {
      openModal, closeModal,
    };

    this.innerSkeletonEls = {headerEls, mainEls, footerEls};
  }

  createModal() {
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

    document.body.removeEventListener('keydown', this.onPressEscape);

    if(this.outsideFuncs.closeModal) {
      this.outsideFuncs.closeModal();
    }
  }

  onPressEscape = (e) => {
    const { key } = e;
    if(this.isOpened && key === 'Escape') {
      this.closeModal();
    }
  };

  onClickAway = (e) => {
    const { target } = e;
    const isClosestInnerModal = skeleton.some(elName => {
      return target.closest(`.modal-${elName}`)
    });
    if(this.isOpened && !isClosestInnerModal) {
      this.closeModal();
    }
  }

  initListeners() {
    document.body.addEventListener('keydown', this.onPressEscape);

    document.body.addEventListener('click', this.onClickAway);
  }
}

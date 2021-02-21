import createEl from "../helpers/createEl.js";
import delay from "../helpers/delay.js";

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
    }
  ) {
    this.modalClassesName = modalClassesName;
    this.isOpened = false;
    this.modalEl = null;

    this.outsideFuncs = {
      openModal, closeModal,
    };

    this.innerSkeletonEls = {headerEls, mainEls, footerEls};
  }

  createModal() {
    const modalEl = createEl({
      className: `modal js-modal ${this.modalClassesName}`,
    })

    skeleton.forEach(elName => {
      const innerEls = this.innerSkeletonEls[`${elName}Els`];

      //if have no els then continue
      if(!(Array.isArray(innerEls) && innerEls.length)) return;

      const newEl = createEl({
        className: `modal-${elName}`,
      });

      innerEls.forEach(innerEl => {
        newEl.append(innerEl);
      });

      modalEl.append(newEl);
    });

    document.body.append(modalEl);

    this.modalEl = modalEl;
  }

  openModal() {
    this.createModal();
    this.initListeners();
    delay.call(this, {
      name: 'isOpenedModal',
      func: () => this.isOpened = true,
    });
  }

  closeModal() {
    this.modalEl.remove();

    document.body.removeEventListener('keydown', this.onPressEscape);

    if(this.outsideFuncs.closeModal) {
      this.outsideFuncs.closeModal();
    }
    this.isOpened = false;
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

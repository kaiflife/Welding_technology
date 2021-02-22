import {catalogInitial, catalogSuccessPutItem} from "../api/catalog.js";
import {jsSelector} from "../helpers/dom.js";
import Modal from "./Modal.js";
import {tryCatch} from "../helpers/errorHandler.js";
import DragDrop from "./DragDrop.js";
import createEl from "../helpers/createEl.js";
import changeDataEl from "../helpers/changeDataEl.js";

const catalogListClass = 'catalog-list';
const catalogListItemClass = `${catalogListClass}-item`;

export default class Catalog {
  constructor(catalogType = catalogInitial) {
    this.catalogType = catalogType;
    this.changedCatalogItem = {};

    this.nodes = {
      catalogList: jsSelector(catalogListClass),
    }

    this.initListeners();
    this.initClicks();
  }

  initClicks() {
    this.nodes.catalogList.onclick = (e) => {
      const { target } = e;

      const isCatalogItem = target.classList.contains(`js-name`);
      if(isCatalogItem) {
        this.targetCatalogItemEl = target.closest(`.js-${catalogListItemClass}`);
        this.openModal();
      }
    }
  }

  async getCatalogRequest() {
    const { success, data } = await tryCatch(() => fetch(this.catalogType));

    if(success) {
      this.initCatalogListItems(data);
    } else {
      console.error('lose request', data);
    }
  }

  async saveCatalogItemRequest() {
    const { data, success } = await tryCatch(() =>
      fetch(catalogSuccessPutItem, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(this.changedCatalogItem),
      })
    );
    if(success) {
      const { name, price } = this.changedCatalogItem;
      const dataEls = [
        {byEl: this.targetCatalogItemEl, innerHTML: name, byQuery: '.js-name'},
        {byEl: this.targetCatalogItemEl, innerHTML: price, byQuery: '.js-price'},
      ];
      dataEls.forEach(data => {
        changeDataEl.call(this, data);
      });

      const previousItem = {};
      this.catalogListItems.forEach((item, index) => {
        if(item.id == this.targetCatalogItemEl.dataset.key) {
          previousItem.index = index;
          previousItem.data = {...item};
        }
      });

      for(let dataName in previousItem.data) {
        if(this.changedCatalogItem[dataName]) {
          previousItem.data[dataName] = this.changedCatalogItem[dataName];
        }
      }

      this.catalogListItems.splice(previousItem.index, 1, previousItem.data);

      this.catalogItemsModal.closeModal();
    } else {
      console.error('unsuccess get data', data);
    }
  }

  initCatalogListItems(items, savePrevious = false) {
    if(!savePrevious) {
      this.nodes.catalogList.innerHTML = null;
      this.catalogListItems = items;
    }
    items.forEach(item => {
      const container = createEl({
        className: `${catalogListClass}-container`,
      });

      const itemBlockEl = createEl({
        className: `${catalogListItemClass} js-${catalogListItemClass}`,
        datasets: [{name: 'key', value: item.id}]
      });

      const blockElsProps = [
        {elName: 'p', className: 'name js-name', innerHTML: item.name || 'Название не указано'},
        {elName: 'p', className: 'price js-price', innerHTML: item.price || 'Цена не указана'},
      ];

      blockElsProps.forEach(item => {
        const newEl = createEl(item);
        itemBlockEl.append(newEl);
      });

      container.append(itemBlockEl);

      this.nodes.catalogList.append(container);
    });

    if(savePrevious) {
      this.catalogListItems = [...this.catalogListItems, ...items];
    }
    if(items.length) {
      if(this.dropDown) this.dropDown = null;
      this.dropDown = new DragDrop(catalogListItemClass, catalogListItemClass);
    }
  }

  onChangeName(value) {
    this.changedCatalogItem.name = value || 'Название не указано';
  }

  onChangePrice(value) {
    this.changedCatalogItem.price = value || 'Цена не указана';
  }

  async saveModalChanges() {
    document.body.classList.add('loading');
    const modalSaveButton = jsSelector('modal-save-button');
    modalSaveButton.disabled = true;

    await this.saveCatalogItemRequest();

    document.body.classList.remove('loading');
    modalSaveButton.disabled = false;
  }

  dragDropHover = (e) => {
    const { detail: { hoverEl, dragDropEl } } = e;

    if(!(dragDropEl && hoverEl)) return;

    const dragDropElId = dragDropEl.dataset.key;
    const hoverElId = hoverEl.dataset.key;
    const copyItems = this.catalogListItems.slice();
    const hoverElIndex = copyItems.findIndex(item => item.id == hoverElId);
    const dragDropElIndex = copyItems.findIndex(item => item.id == dragDropElId);
    const dragDropItem = this.catalogListItems.find(item => item.id == dragDropElId);
    const hoverElItem = this.catalogListItems.find(item => item.id == hoverElId);
    const isCloseToDropDownEl = Math.abs(hoverElIndex - dragDropElIndex) === 1;
    const isLastIndexHover = hoverElIndex === copyItems.length - 1;
    if(isCloseToDropDownEl) {
      copyItems.splice(hoverElIndex, 1, dragDropItem);
      copyItems.splice(dragDropElIndex, 1, hoverElItem);
    } else if((dragDropElIndex < hoverElIndex) && isLastIndexHover) {
      copyItems.splice(hoverElIndex, 1, dragDropItem);
      copyItems.splice(hoverElIndex, 0, hoverElItem);
      copyItems.splice(dragDropElIndex, 1);
    } else {
      copyItems.splice(hoverElIndex, 0, dragDropItem);
      copyItems.splice(dragDropElIndex+1, 1);
    }

    this.initCatalogListItems(copyItems);
  }

  openModal() {
    const valueName = this.targetCatalogItemEl.querySelector('.js-name').innerHTML;
    const valuePrice = this.targetCatalogItemEl.querySelector('.js-price').innerHTML;

    const mainElsProps = [
      {className: 'name', elName: 'label', innerHTML: 'Название товара'},
      {className: 'name', elName: 'input', value: valueName, onchange: (e) => this.onChangeName(e.target.value)},
      {className: 'price', elName: 'label', innerHTML: 'Цена товара'},
      {className: 'price', type: 'number', elName: 'input', value: valuePrice, onchange: (e) => this.onChangePrice(e.target.value)},
      {className: 'control-button js-modal-save-button', elName: 'button', onclick: () => this.saveModalChanges(), innerHTML: 'Сохранить изменения'},
    ];

    const modalMainEls = mainElsProps.map(item => createEl(item));

    this.catalogItemsModal = new Modal({
      mainEls: modalMainEls,
      modalClassesName: 'catalog-item-modal js-catalog-item-modal',
      closeModal: this.closeModal,
    });

    this.catalogItemsModal.openModal();
  }

  closeModal = () => {
    this.changedCatalogItem = {};
    this.catalogItemsModal = null;
  }

  initListeners() {
    document.body.addEventListener('keydown', (e) => {
      const { key } = e;
      if(key === 'Enter') {
        if(this.catalogItemsModal?.isOpened) {
          this.saveModalChanges()
        }
      }
    });

    document.body.addEventListener('dragDropHover', this.dragDropHover)
  }
}

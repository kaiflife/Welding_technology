import {catalogInitial, catalogSuccessPutItem} from "../api/catalog.js";
import {jsSelector} from "../helpers/dom.js";
import Modal from "./Modal.js";
import {tryCatch} from "../helpers/errorHandler.js";
import DragDrop from "./DragDrop.js";

const catalogListItemClass = 'catalog-list-item';

export default class Catalog {
  constructor(catalogType = catalogInitial) {
    this.catalogType = catalogType;
    this.changedCatalogItem = {};

    this.nodes = {
      catalogList: jsSelector('catalog-list'),
    }

    this.initListeners();
    this.initClicks();
  }

  initClicks() {
    this.nodes.catalogList.onclick = (e) => {
      const { target } = e;

      const isCatalogItem = target.classList.contains(`js-${catalogListItemClass}`);
      if(isCatalogItem) {
        this.targetCatalogItemEl = target;
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
      const catalogNameEl = this.targetCatalogItemEl.querySelector('.name');
      const { name, price } = this.changedCatalogItem;
      if(name) {
        catalogNameEl.innerHTML = name;
      }

      const catalogPriceEl = this.targetCatalogItemEl.querySelector('.price');
      if(price) {
        catalogPriceEl.innerHTML = price;
      }

      this.catalogItemsModal.closeModal();
    } else {
      console.error('un success get data', data);
    }
  }

  initCatalogListItems(items, savePrevious = false) {
    if(!savePrevious) {
      this.nodes.catalogList.innerHTML = null;
      this.catalogListItems = items;
    }
    items.forEach(item => {
      const itemBlockEl = document.createElement('div');
      itemBlockEl.className = `${catalogListItemClass} js-${catalogListItemClass}`;
      itemBlockEl.dataset.key = item.id;

      const itemNameEl = document.createElement('p');
      itemNameEl.className = 'name';
      itemNameEl.innerHTML = item.name || 'Название не указано';

      const itemPriceEl = document.createElement('p');
      itemPriceEl.className = 'price';
      itemPriceEl.innerHTML = item.price || 'Цена не указана';

      const blockEls = [
        itemNameEl,
        itemPriceEl,
      ];
      blockEls.forEach(el => {
        itemBlockEl.append(el);
      });

      this.nodes.catalogList.append(itemBlockEl);
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

    if(!dragDropEl) return;

    const dragDropElId = dragDropEl.dataset.key;
    if(!hoverEl) {
      const copyItems = this.catalogListItems.filter(item => item.id != dragDropElId);
      const draggableItem = this.catalogListItems.find(item => item.id == dragDropElId);
      copyItems.push(draggableItem);
      this.initCatalogListItems(copyItems);
      return;
    }

    const hoverElId = hoverEl.dataset.key;
    const copyItems = this.catalogListItems.filter(item => item.id != dragDropElId);
    const hoverElIndex = copyItems.findIndex(item => item.id == hoverElId);
    const draggableItem = this.catalogListItems.find(item => item.id == dragDropElId);
    copyItems.splice(hoverElIndex, 0, draggableItem);
    this.initCatalogListItems(copyItems);
  }

  openModal() {
    const modalEl = document.createElement('div');
    modalEl.className = 'modal js-modal';

    const nameTitleEl = document.createElement('label');
    nameTitleEl.className = 'name';
    nameTitleEl.innerHTML = 'Название товара';
    const nameInputEl = document.createElement('input');
    nameInputEl.className = 'name';
    nameInputEl.value = this.targetCatalogItemEl.querySelector('.name').innerHTML;
    nameInputEl.onchange = (e) => this.onChangeName(e.target.value);

    const priceTitleEl = document.createElement('label');
    priceTitleEl.className = 'price';
    priceTitleEl.innerHTML = 'Цена товара';
    const priceInputEl = document.createElement('input');
    priceInputEl.className = 'price';
    priceInputEl.onchange = (e) => this.onChangePrice(e.target.value);
    priceInputEl.value = this.targetCatalogItemEl.querySelector('.price').innerHTML;
    priceInputEl.type = 'number';

    const saveChangesEl = document.createElement('button');
    saveChangesEl.className = 'control-button js-modal-save-button';
    saveChangesEl.onclick = () => this.saveModalChanges();
    saveChangesEl.innerHTML = 'Сохранить изменения';

    const modalEls = [nameTitleEl, nameInputEl, priceTitleEl, priceInputEl, saveChangesEl];

    this.catalogItemsModal = new Modal({
      mainEls: modalEls,
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

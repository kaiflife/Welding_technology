import {catalogInitial, catalogSuccessPutItem} from "../api/catalog.js";
import {jsSelector} from "../helpers/dom.js";
import Modal from "./Modal.js";
import {tryCatch} from "../helpers/errorHandler.js";

const catalogListItemClass = 'catalog-list-item';

export default class Catalog {
  constructor(catalogType = catalogInitial) {
    this.catalogType = catalogType;
    this.changedCatalogItem = {};

    this.nodes = {
      catalogList: jsSelector('catalog-list'),
    }

    this.initListeners();
  }

  async getCatalogRequest() {
    const { success, data } = await tryCatch(() => fetch(this.catalogType));

    if(success) {
      const catalogListItems = data;
      this.catalogListItems = catalogListItems;

      console.log(catalogListItems);

      this.initCatalogListItems(catalogListItems);
    } else {
      console.error('lose request', e);
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
      this.targetCatalogItem.querySelector('.name').innerHTML = this.changedCatalogItem.name;
      this.targetCatalogItem.querySelector('.price').innerHTML = this.changedCatalogItem.price;
      this.catalogItemsModal.closeModal();
    } else {
      console.error('un success get data', data);
    }
  }

  initCatalogListItems(items) {
    items.forEach(item => {
      const itemBlockEl = document.createElement('div');
      itemBlockEl.className = `${catalogListItemClass} js-${catalogListItemClass}`;
      itemBlockEl.dataset.key = item.id;

      const itemNameEl = document.createElement('p');
      itemNameEl.className = 'name';
      itemNameEl.innerHTML = item.name;

      const itemPriceEl = document.createElement('p');
      itemPriceEl.className = 'price';
      itemPriceEl.innerHTML = item.price || 'Нет в наличии';

      const blockEls = [
        itemNameEl,
        itemPriceEl,
      ];
      blockEls.forEach(el => {
        itemBlockEl.append(el);
      });

      this.nodes.catalogList.append(itemBlockEl);
    });
  }

  onChangeName(value) {
    this.changedCatalogItem.name = value;
  }

  onChangePrice(value) {
    this.changedCatalogItem.price = value || 'Товара нету в наличии';
  }

  async saveModalChanges() {
    document.body.classList.add('loading');
    const modalSaveButton = jsSelector('modal-save-button');
    modalSaveButton.disabled = true;

    await this.saveCatalogItemRequest();

    document.body.classList.remove('loading');
    modalSaveButton.disabled = false;
  }

  initListeners() {
    document.body.addEventListener('click', (e) => {
      const { target } = e;

      const closestItemEl = target.closest(`.js-${catalogListItemClass}`);
      if(closestItemEl) {
        this.targetCatalogItem = closestItemEl;
        this.openModal();
      }
    });
  }

  openModal() {
    const modalEl = document.createElement('div');
    modalEl.className = 'modal js-modal';

    const nameTitleEl = document.createElement('label');
    nameTitleEl.className = 'name';
    const nameInputEl = document.createElement('input');
    nameInputEl.className = 'name';
    nameInputEl.value = this.targetCatalogItem.querySelector('.name').innerHTML;
    nameInputEl.onchange = (e) => this.onChangeName(e.target.value);

    const priceTitleEl = document.createElement('label');
    priceTitleEl.className = 'price';
    const priceInputEl = document.createElement('input');
    priceInputEl.className = 'price';
    priceInputEl.onchange = (e) => this.onChangePrice(e.target.value);
    priceInputEl.value = this.targetCatalogItem.querySelector('.price').innerHTML;
    priceInputEl.type = 'number';

    const saveChangesEl = document.createElement('button');
    saveChangesEl.className = 'control-button js-modal-save-button';
    saveChangesEl.onclick = () => this.saveModalChanges();
    saveChangesEl.innerHTML = 'Сохранить изменения';

    const modalEls = [nameTitleEl, nameInputEl, priceTitleEl, priceInputEl, saveChangesEl];

    this.catalogItemsModal = new Modal({
      mainEls: modalEls,
      modalClassesName: 'catalog-item-modal js-catalog-item-modal',
    });

    this.catalogItemsModal.openModal();
  }

  closeModal() {
    this.changedCatalogItem = {};
    this.catalogItemsModal.closeModal();
    this.catalogItemsModal = null;
  }
}

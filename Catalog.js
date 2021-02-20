import {catalogInitial} from "./api/catalog";
import {jsSelector} from "./helpers/dom";

const catalogLevelClass = 'catalog-level';
const catalogListClass = 'catalog-list';
const catalogListItemClass = 'catalog-list-item';

export default class Catalog {
  constructor(catalogType = catalogInitial) {
    this.catalogType = catalogType;
    this.nodes = {
      catalogLevel: jsSelector(catalogLevelClass),
      catalogList: jsSelector(catalogListClass),
    }

    this.initListeners();
  }

  async getCatalogRequest() {
    const data = await fetch(this.catalogType);

    console.log(data);

    const catalogListItems = data.json();
    this.catalogListItems = catalogListItems;

    console.log(catalogListItems);

    this.initCatalogListItems(catalogListItems);
  }

  initCatalogListItems(items) {
    items.forEach(item => {
      const itemBlockEl = document.createElement('div');
      itemBlockEl.className = `${catalogListItemClass} js-${catalogListItemClass}`;
      itemBlockEl.dataset.key = item.id;

      const itemNameEl = document.createElement('p');
      itemNameEl.className = 'title';
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
    });
  }

  onChangeName(value) {
    this.changedName = value;
  }

  onChangePrice(value) {
    this.changedPrice = value;
  }

  initListeners() {
    document.body.addEventListener('click', (e) => {
      const { target } = e;

      if(target.className.contains(`js-${catalogListItemClass}`)) {
        this.targetCatalotItem = target;
        this.openModal();
      }
    });
  }

  openModal() {
    const catalogModalEl = document.createElement('div');
    catalogModalEl.className = 'modal js-modal catalog-item-modal js-catalog-item-modal';

    const nameTitleEl = document.createElement('label');
    nameTitleEl.className = 'name';
    const nameInputEl = document.createElement('input');
    nameInputEl.className = 'name';
    nameInputEl.onchange = (e) => this.onChangeName(e.target.value);

    const priceTitleEl = document.createElement('label');
    priceTitleEl.className = 'price';
    const priceInputEl = document.createElement('input');
    priceInputEl.className = 'price';
    priceInputEl.onchange = (e) => this.onChangePrice(e.target.value);
  }
}

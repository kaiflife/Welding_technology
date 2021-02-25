"use strict";

import Catalog from "./components/Catalog.js";

const render = async () => {
  const catalog = new Catalog();

  Promise.all([
    catalog.getCategoriesRequest(),
    catalog.getCatalogRequest(),
  ]);
}


render();

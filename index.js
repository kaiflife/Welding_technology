"use strict";

import Catalog from "./components/Catalog.js";

const render = async () => {
  const catalog = new Catalog();
  await catalog.getCatalogRequest();
}


render();

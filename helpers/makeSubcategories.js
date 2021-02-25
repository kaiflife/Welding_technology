import createEl from "./createEl.js";
import {jsSelector} from "./dom.js";

export const createCategoriesListItems = (items, containerClass) => {
    const objectCategoryIndexes = makeSubcategoryIndexes(items);
    const categories = {};
    items.forEach(category => {
        categories[category.id] = {...category};
    });

    const container = jsSelector(containerClass);

    for(let i in objectCategoryIndexes) {
        const category = categories[i];
        const appendInnerHTML = createEl({
            elName: 'label',
            innerHTML: category.name
        });
        let parentEl = createEl({
            datasets: [{name: 'key', value: category.id}],
            className: 'category js-category',
            appendInnerHTML,
        });
        parentEl = createDeepSubcategories({
            parentEl,
            objectCategories: categories,
            categoriesIndexes: objectCategoryIndexes,
            subcategoryIndexes: objectCategoryIndexes[i].subcategories,
        });
        container.append(parentEl);
    }
}

export const createDeepSubcategories = ({parentEl, objectCategories, subcategoryIndexes, categoriesIndexes}) => {
    if(!subcategoryIndexes || !subcategoryIndexes.length) {
        return parentEl;
    }
    subcategoryIndexes.forEach(item => {
        if(categoriesIndexes[item] && categoriesIndexes[item].subcategories.length) {
            const newSubIndexes = categoriesIndexes[item].subcategories;
            const category = objectCategories[item];
            const appendInnerHTML = createEl({
                elName: 'label',
                innerHTML: category.name
            });
            const newSubParent = createEl({
                className: 'category js-category',
                datasets: [{name: 'key', value: category.id}],
                appendInnerHTML,
            });
            const subParent = createDeepSubcategories({
                parentEl: newSubParent,
                objectCategories,
                categoriesIndexes,
                subcategoryIndexes: newSubIndexes,
            });
            parentEl.append(subParent);
        } else {
            const category = objectCategories[item];
            const appendInnerHTML = createEl({
                elName: 'label',
                innerHTML: category.name
            });
            parentEl.append(createEl({
                className: 'category js-category',
                datasets: [{name: 'key', value: category.id}],
                appendInnerHTML,
            }));
        }
    });
    return parentEl;
}

export const makeSubcategoryIndexes = (items, parentIdField = 'parentId') => {
    const categories = {};
    items.forEach((category) => {
        if(category[parentIdField]) {
            const parentCategory = categories[category[parentIdField]];
            const subcategories = [category.id];
            if(parentCategory) {
                if(parentCategory.subcategories) {
                    parentCategory.subcategories.push(category.id);
                } else {
                    categories[category[parentIdField]] = {subcategories};
                }
            } else {
                categories[category[parentIdField]] = {subcategories};
            }
        } else if(!categories[category.id]) {
            categories[category.id] = {
                subcategories: [],
            }
        }});
    return categories;
}

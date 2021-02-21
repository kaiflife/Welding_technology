const dragDropActiveClass = 'drag-drop-active';

export default class DragDrop {
  constructor(elClass, hoverElClass, customEventName = 'dragDropHover') {
    this.elClass = `js-${elClass}`;
    this.hoverElClass = hoverElClass;
    this.customEventName = customEventName;

    this.initListeners();
  }

  moveAt = (e) => {
    this.dragDropEl.style.left = e.pageX - this.shiftX + 'px';
    this.dragDropEl.style.top = e.pageY - this.shiftY + 'px';
    this.hoverStart(e);
  }

  clearDragDropTimeout = () => {
    if(this.dragDropTimeout) {
      clearTimeout(this.dragDropTimeout);
    }
  }

  dragDropEnd = (e) => {
    this.clearDragDropTimeout();

    if(!this.dragDropEl) return;
    this.checkHoverableItem(e);

    this.changeDragDropItemStyles({ isRemove: true })
    this.dragDropEl.onmouseup = null;
    document.body.removeEventListener('mousemove', this.moveAt);
    this.shiftX = null;
    this.shiftY = null;
    this.dragDropEl = null;
    this.hoverEl = null;
  }

  changeDragDropItemStyles = ({
      styles = {
        height: `${this.dragDropEl.offsetHeight}px`,
        width: `${this.dragDropEl.offsetWidth}px`,
      }, isRemove = false} = {}) => {
    for(const styleName in styles) {
      this.dragDropEl.style[styleName] = isRemove ? null : styles[styleName];
    }
    this.dragDropEl.classList.add(dragDropActiveClass);
    document.body.classList[isRemove ? 'remove' : 'add']('body-drag-drop');

    if(isRemove) {
      ['left', 'top'].forEach(styleName => {
        this.dragDropEl.style[styleName] = null;
      });
      this.dragDropEl.classList.remove(dragDropActiveClass);
    }
  }

  hoverStart = (e) => {
    if(this.hoverElClass) {
      const { target } = e;
      if(target.classList.contains(this.elClass) && !target.classList.contains(dragDropActiveClass)) {
        this.hoverEl = target;
      } else {
        this.hoverEl = null;
      }
    }
  }

  checkHoverableItem = (e) => {
    if(!(this.hoverElClass)) return;

    if(!this.hoverEl) {
      const dragDropHover = new CustomEvent(this.customEventName, {
        detail: { dragDropEl: this.dragDropEl }
      });
      document.body.dispatchEvent(dragDropHover);
      return;
    }

    const { pageX, pageY } = e;
    const hoverBoundedProps = this.hoverEl.getBoundingClientRect();
    const hasCollision = hoverBoundedProps.right >= pageX &&
      hoverBoundedProps.left <= pageX &&
      hoverBoundedProps.top <= pageY &&
      hoverBoundedProps.bottom >= pageY;
    if(hasCollision) {
      const dragDropHover = new CustomEvent(this.customEventName, {
          detail: { hoverEl: this.hoverEl, dragDropEl: this.dragDropEl }
      });
      document.body.dispatchEvent(dragDropHover);
    }
  }

  dragDropStart = (e) => {
    const { target } = e;

    const closestItem = target.closest(`.${this.elClass}`);
    if(closestItem) {
      this.clearDragDropTimeout();

      //After mousedown with delay 500 ms dropdown will start
      this.dragDropTimeout = setTimeout(() => {
        e.preventDefault();
        this.dragDropEl = closestItem;
        this.shiftX = e.clientX - this.dragDropEl.getBoundingClientRect().left;
        this.shiftY = e.clientY - this.dragDropEl.getBoundingClientRect().top;
        this.changeDragDropItemStyles();

        this.moveAt(e);
        document.body.addEventListener('mousemove', this.moveAt);
      }, 500);
    }
  }

  initListeners() {
    document.body.addEventListener('mousedown', this.dragDropStart);
    document.body.addEventListener('mouseup', this.dragDropEnd);
    document.body.addEventListener('mouseover', this.dragDropEl);
  }
}

import {jsSelector, scrollToEl} from "../helpers/dom.js";

const dragDropActiveClass = 'drag-drop-active';

export default class DragDrop {
  constructor({elClass, hoverElClass, customEventName = 'dragDropHover'}) {
    this.elClass = `js-${elClass}`;
    this.hoverElClass = hoverElClass;
    this.customEventName = customEventName;

    this.initListeners();
  }

  moveAt = (e) => {
    let touch;
    if(this.checkTouchEvent()) {
      touch = e.changedTouches[0];
      if(e.cancelable) {
        e.preventDefault();
        this.dragDropScroll(e);
      } else {
        return;
      }
    }
    this.dragDropEl.style.left = (touch ? touch.pageX : e.pageX) - this.shiftX + 'px';
    this.dragDropEl.style.top = (touch ? touch.pageY : e.pageY) - this.shiftY + 'px';
  }

  clearDragDropTimeout = () => {
    if(this.dragDropTimeout) {
      clearTimeout(this.dragDropTimeout);
    }
  }

  dragDropEnd = () => {
    this.clearDragDropTimeout();

    if(!this.dragDropEl) return;
    this.checkHoverableItem();

    this.changeDragDropItemStyles({ isRemove: true })

    document.body.removeEventListener(this.moveEventName, this.moveAt, { passive: true });

    this.shiftX = null;
    this.shiftY = null;
    this.dragDropEl = null;
  }

  changeDragDropItemStyles = ({styles = {height: `${this.dragDropEl.offsetHeight}px`, width: `${this.dragDropEl.offsetWidth}px`}, isRemove = false} = {}) => {
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

  checkTouchEvent = () => this.moveEventName === 'touchmove';

  checkHoverableItem = () => {
    if(!(this.hoverElClass)) return;

    const dragDropProps = this.dragDropEl.getBoundingClientRect();
    const hoverItems = jsSelector(`${this.hoverElClass}:not(.${dragDropActiveClass}`, true);
    const target = hoverItems.find(item => {
      const hoverBoundedProps = item.getBoundingClientRect();
      const hasCollision = hoverBoundedProps.x <= dragDropProps.right &&
        hoverBoundedProps.right >= dragDropProps.x &&
        hoverBoundedProps.y <= dragDropProps.bottom &&
        hoverBoundedProps.bottom >= dragDropProps.y;
      if(hasCollision) {
        return item;
      }
    });

    if(!target) return;

    const dragDropHover = new CustomEvent(this.customEventName, {
        detail: { hoverEl: target, dragDropEl: this.dragDropEl }
    });
    document.body.dispatchEvent(dragDropHover);
  }

  dragDropScroll = (e) => {
    const dragDropRect = this.dragDropEl.getBoundingClientRect();
    const el = this.dragDropEl;
    const maxScrollHeight = document.body.scrollHeight;
    const maxScreenHeight = window.screen.height;
    const halfRect = dragDropRect.height/2;
    if(dragDropRect.bottom >= maxScreenHeight && (maxScrollHeight - halfRect >= e.touches[0].pageY)) {
      scrollToEl({ el, block: 'end'});
    } else if(dragDropRect.top <= -halfRect) {
      scrollToEl({ el, block: 'start'});
    }
  }

  dragDropStart = (e) => {
    const { target } = e;

    const closestItem = target.closest(`.${this.elClass}`);
    if(closestItem) {
      this.clearDragDropTimeout();

      //After mousedown with delay 500 ms dropdown will start
      this.dragDropTimeout = setTimeout(() => {
        const touches = e.changedTouches;
        let touch;
        if(!touches) {
          e.preventDefault();
        } else {
          touch = touches[0];
        }
        this.moveEventName = touches ? 'touchmove' : 'mousemove';
        this.dragDropEl = closestItem;
        this.shiftX = (touches ? touch.clientX : e.clientX) - this.dragDropEl.getBoundingClientRect().left;
        this.shiftY = (touches ? touch.clientY : e.clientY) - this.dragDropEl.getBoundingClientRect().top;
        this.changeDragDropItemStyles();

        this.moveAt(e);
        document.body.addEventListener(this.moveEventName, this.moveAt, {passive: !this.checkTouchEvent()});
      }, 500);
    }
  }

  initListeners() {
    this.listeners = [
      {name: 'mousedown', func: this.dragDropStart},
      {name: 'mouseup', func: this.dragDropEnd},
      {name: 'mouseover', func: this.dragDropEl},
      {name: 'touchstart', func: this.dragDropStart},
      {name: 'touchend', func: this.dragDropEnd},
    ];

    this.listeners.forEach(listener => {
      document.body.addEventListener(listener.name, listener.func);
    });
  }

  removeAllListeners() {
    this.listeners.forEach(listener => {
      document.body.removeEventListener(listener.name, listener.func);
    });
  }
}

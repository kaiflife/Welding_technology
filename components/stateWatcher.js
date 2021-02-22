export default class StateWatcher {
  constructor() {
    this.state = document.body.querySelectorAll('*[data-state-name]');
    console.log(this.state);
  }
}

import { Accessor, createSignal, Setter } from "solid-js";

export class SiteHead {
  static getTitle: Accessor<string>;
  private static _setTitle: Setter<string>;
  private static __defaultTitle = "Hilmy's Web";

  static init() {
    [this.getTitle, this._setTitle] = createSignal(this.__defaultTitle);
  }

  static setTitle(title?: string) {
    this._setTitle(`${title ? `${title} - ` : ""}${this.__defaultTitle}`);
  }
}

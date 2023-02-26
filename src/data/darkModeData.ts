import { Accessor, createSignal, Setter } from "solid-js";

export class DarkModeData {
  static get: Accessor<boolean>;
  private static _set: Setter<boolean>;

  static init() {
    const theme = localStorage.getItem("theme");
    [this.get, this._set] = createSignal(
      theme
        ? theme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  static set(isDarkMode: boolean) {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    this._set(isDarkMode);
  }
}

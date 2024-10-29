import { debounce } from "@solid-primitives/scheduled";
import { DarkModeData } from "../../data/darkModeData";
import styles from "./Search.module.css";

export default function Search(props: {
  value: string;
  executeSearch: (searchValue?: string) => void;
}) {
  let searchRef: HTMLInputElement | undefined;

  const debounceSearchValue = debounce((value: string) => {
    props.executeSearch(value);
  }, 500);

  function onInputSearchField(
    e: Event & {
      currentTarget: HTMLInputElement;
      target: Element;
    }
  ) {
    debounceSearchValue(e.currentTarget.value);
  }

  function removeSearchFieldValue() {
    if (searchRef?.value) {
      props.executeSearch();
      searchRef.value = "";
    }
  }

  return (
    <div class="relative sm:min-w-[18rem]">
      <label for="search" class="absolute px-2 py-1 cursor-text">
        🔍
      </label>
      <input
        ref={searchRef}
        type="search"
        id="search"
        name="search"
        title="Search"
        placeholder="Find some blog posts here"
        oninput={onInputSearchField}
        value={props.value}
        class={`w-full pl-8 pr-7 py-1.5 bg-transparent outline outline-1 ${
          DarkModeData.get()
            ? "outline-white placeholder:text-white/50"
            : "outline-black placeholder:text-black/50"
        } text-sm rounded-md ${styles.input}`}
      />
      <button
        onclick={removeSearchFieldValue}
        title="Clear search field"
        class="absolute right-0 px-2 py-1 rounded-md "
      >
        ✕
      </button>
    </div>
  );
}

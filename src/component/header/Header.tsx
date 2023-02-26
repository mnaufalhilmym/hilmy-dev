import { A, useLocation } from "@solidjs/router";
import { Match, Show, Switch } from "solid-js";
import { DarkModeData } from "../../data/darkModeData";

export default function Header() {
  const location = useLocation();

  function changeDarkMode() {
    DarkModeData.set(!DarkModeData.get());
  }

  return (
    <header class="pb-8 flex items-center justify-between gap-x-10">
      {/* Start of the left side */}
      <div class="flex-1 flex gap-x-2 font-bold text-xl">
        <Show
          when={location.pathname === "/"}
          fallback={
            <A href="/" title="Back">
              🔙
            </A>
          }
        >
          <span title="Home" class="text-xl">
            🏡
          </span>
        </Show>
        <span class="line-clamp-1 break-all">{location.pathname}</span>
      </div>
      {/* End of the left side */}

      {/* Start of the right side */}
      <div>
        <button
          onclick={changeDarkMode}
          title="Change theme"
          class="ml-auto text-xl"
        >
          <Switch fallback="🌚">
            <Match when={DarkModeData.get()}>🌞</Match>
          </Switch>
        </button>
      </div>
      {/* End of the right side */}
    </header>
  );
}

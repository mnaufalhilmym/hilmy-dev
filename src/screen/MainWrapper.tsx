import { Outlet } from "@solidjs/router";
import { Toaster } from "solid-toast";
import Header from "../component/header/Header";
import { DarkModeData } from "../data/darkModeData";

export default function MainWrapper() {
  return (
    <div classList={{ dark: DarkModeData.get() }}>
      <div class="min-w-screen min-h-screen p-8 dark:bg-black font-mono dark:text-white transition-colors">
        <div class="max-w-screen-sm mx-auto">
          <Toaster position="top-center" />
          <Header />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

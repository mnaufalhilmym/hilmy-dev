import { Toaster } from "solid-toast";
import Header from "../component/header/Header";
import { DarkModeData } from "../data/darkModeData";
import { createRenderEffect, JSX } from "solid-js";
import { GqlClient } from "../api/gqlClient";
import SiteHead from "../data/siteHead";
import Head from "../component/head/Head";

interface Props {
  children?: JSX.Element;
}

export default function MainWrapper(props: Props) {
  createRenderEffect(() => {
    GqlClient.init();
    DarkModeData.init();
    SiteHead.init();
  });

  return (
    <>
      <Head />

      <div classList={{ dark: DarkModeData.get() }}>
        <div class="min-w-screen min-h-screen p-8 dark:bg-black font-mono dark:text-white transition-colors">
          <div class="max-w-screen-sm mx-auto">
            <Toaster position="top-center" />
            <Header />
            {props.children}
          </div>
        </div>
      </div>
    </>
  );
}

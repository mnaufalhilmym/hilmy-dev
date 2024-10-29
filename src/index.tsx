/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import { Navigate, RouteDefinition, Router } from "@solidjs/router";
import { lazy } from "solid-js";
import { SitePathData } from "./data/sitePathData";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

const routes: RouteDefinition[] = [
  {
    path: "/",
    component: lazy(() => import("./screen/MainWrapper")),
    children: [
      {
        path: "/",
        component: lazy(() => import("./screen/home/HomeScreen")),
      },
      {
        path: SitePathData.aboutPath,
        component: lazy(() => import("./screen/about/AboutScreen")),
      },
      {
        path: SitePathData.postPath,
        children: [
          {
            path: "/",
            component: () => <Navigate href="/" />,
          },
          {
            path: "/:id",
            component: lazy(() => import("./screen/post/PostScreen")),
          },
        ],
      },
      {
        path: SitePathData.toolsPath,
        component: lazy(() => import("./screen/tools/ToolsScreen")),
      },
      {
        path: SitePathData.projectsPath,
        children: [
          {
            path: "/",
            component: lazy(() => import("./screen/projects/ProjectsScreen")),
          },
          {
            path: "/:id",
            component: lazy(
              () => import("./screen/projects/ProjectItemScreen")
            ),
          },
        ],
      },
      {
        path: "/*",
        component: lazy(() => import("./screen/404")),
      },
    ],
  },
];

render(() => <Router>{routes}</Router>, root!);

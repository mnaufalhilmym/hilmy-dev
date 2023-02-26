import { Navigate, RouteDefinition, useRoutes } from "@solidjs/router";
import { Component, createRenderEffect, lazy } from "solid-js";
import Head from "./component/head/head";
import { DarkModeData } from "./data/darkModeData";
import { SiteHead } from "./data/siteHead";
import { SitePathData } from "./data/sitePathData";

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
            element: () => <Navigate href="/" />,
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

const App: Component = () => {
  const Routes = useRoutes(routes);

  createRenderEffect(() => {
    SiteHead.init();
    DarkModeData.init();
  });

  return (
    <>
      <Head />
      <Routes />
    </>
  );
};

export default App;

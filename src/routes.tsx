import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { env } from "@config";
import { ROUTES } from "@config/routes";

const View = lazy(() => import("@layouts/View"));
const Home = lazy(() => import("@views/Home"));
const Play = lazy(() => import("@views/Play"));
const Help = lazy(() => import("@views/Help"));
const Scoreboard = lazy(() => import("@views/Scoreboard"));
const Profile = lazy(() => import("@views/Profile"));
const NotFound = lazy(() => import("@views/NotFound"));

const routes = createBrowserRouter(
  [
    {
      path: ROUTES.HOME,
      element: <View />,
      children: [
        { index: true, element: <Home /> },
        { path: ROUTES.PLAY, element: <Play /> },
        { path: ROUTES.HELP, element: <Help /> },
        { path: ROUTES.SCOREBOARD, element: <Scoreboard /> },
        { path: ROUTES.SETTINGS, element: <Profile /> },
        { path: ROUTES.PROFILE, element: <Profile /> },
        {
          path: "/*",
          element: <NotFound />,
        },
      ],
    },
  ],
  { basename: env.baseUrl },
);

export default routes;

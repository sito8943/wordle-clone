import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { env } from "@config";

const View = lazy(() => import("@layouts/View"));
const Home = lazy(() => import("@views/Home"));
const Play = lazy(() => import("@views/Play"));
const Scoreboard = lazy(() => import("@views/Scoreboard"));
const Profile = lazy(() => import("@views/Profile"));
const NotFound = lazy(() => import("@views/NotFound"));

const routes = createBrowserRouter(
  [
    {
      path: "/",
      element: <View />,
      children: [
        { index: true, element: <Home /> },
        { path: "/play", element: <Play /> },
        { path: "/scoreboard", element: <Scoreboard /> },
        { path: "/settings", element: <Profile /> },
        { path: "/profile", element: <Profile /> },
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

import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { env } from "@config";

const View = lazy(() => import("@layouts/View"));
const Home = lazy(() => import("@views/Home"));
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
        { path: "/scoreboard", element: <Scoreboard /> },
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

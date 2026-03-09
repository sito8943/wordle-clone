import { createBrowserRouter } from "react-router";
import { Home, NotFound, Profile, Scoreboard } from "./views";
import { View } from "./layouts/";

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
  { basename: import.meta.env.BASE_URL },
);

export default routes;

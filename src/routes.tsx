import { createBrowserRouter } from "react-router";
import { Home, Scoreboard } from "./views";
import { View } from "./layouts/";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <View />,
    children: [
      { index: true, element: <Home /> },
      { path: "/scoreboard", element: <Scoreboard /> },
    ],
  },
]);

export default routes;

import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { SplashScreen } from "@components";
import routes from "./routes";

function App() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <RouterProvider router={routes} />
    </Suspense>
  );
}

export default App;

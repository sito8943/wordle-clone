import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { SplashScreen } from "@components";
import AppUpdateBanner from "./AppUpdateBanner";
import routes from "./routes";

function App() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <RouterProvider router={routes} />
      <AppUpdateBanner />
    </Suspense>
  );
}

export default App;

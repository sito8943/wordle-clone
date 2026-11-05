import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { SplashScreen } from "@components";
// Not in the @components barrel: it would pull consent into every importer.
import { DataChoices } from "@components/DataChoices";
import AppUpdateBanner from "./AppUpdateBanner";
import routes from "./routes";

function App() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <RouterProvider router={routes} />
      <AppUpdateBanner />
      <DataChoices />
    </Suspense>
  );
}

export default App;

import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import JournalEntry from "./pages/JournalEntry";
import LandingPage from "./pages/LandingPage";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="entry/:id" element={<JournalEntry />} />
        </Route>
      </>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;

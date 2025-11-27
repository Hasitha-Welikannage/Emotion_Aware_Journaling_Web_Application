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
import JournalEntries from "./pages/JournalEntries";
import Profile from "./pages/Profile";
import EmotionHistory from "./pages/EmotionHistory";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="journal-entry/:id" element={<JournalEntry />} />
          <Route path="journals" element={<JournalEntries />} />
          <Route path="profile" element={<Profile />} />
          <Route path="emotion-history" element={<EmotionHistory />} />
        </Route>
      </>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;

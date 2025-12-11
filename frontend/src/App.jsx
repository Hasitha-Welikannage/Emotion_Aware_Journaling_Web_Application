import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import JournalEntry from "./pages/JournalEntry";
import LandingPage from "./pages/LandingPage";
import JournalEntries from "./pages/JournalEntries";
import Profile from "./pages/Profile";
import EmotionHistory from "./pages/EmotionHistory";
import Login from "./auth/Login";
import Register from "./auth/Register";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="entry/:id" element={<JournalEntry />} />
            <Route path="journals" element={<JournalEntries />} />
            <Route path="profile" element={<Profile />} />
            <Route path="emotion-history" element={<EmotionHistory />} />
            <Route path="create" element={<JournalEntry />} />
            <Route path="edit/:id" element={<JournalEntry />} />
          </Route>
        </Route>
      </>
    )
  );

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

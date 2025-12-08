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
        <Route path="/app" element={<MainLayout />}>
          <Route
            index
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="entry/:id"
            element={
              <PrivateRoute>
                <JournalEntry />
              </PrivateRoute>
            }
          />
          <Route
            path="journals"
            element={
              <PrivateRoute>
                <JournalEntries />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="emotion-history"
            element={
              <PrivateRoute>
                <EmotionHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="create"
            element={
              <PrivateRoute>
                <JournalEntry />
              </PrivateRoute>
            }
          />
          <Route
            path="edit/:id"
            element={
              <PrivateRoute>
                <JournalEntry/>
              </PrivateRoute>
            }
          />
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

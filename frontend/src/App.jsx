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
import LandingPage from "./pages/LandingPage";
import JournalEntries from "./pages/JournalEntries";
import Profile from "./pages/Profile";
import EmotionHistory from "./pages/EmotionHistory";
import Login from "./auth/Login";
import Register from "./auth/Register";
import NotFound from "./pages/NotFound";
import JournalEntryCreate from "./pages/JournalEntryCreate";
import JournalEntryEdit from "./pages/JournalEntryEdit";
import JournalEntryView from "./pages/JournalEntryView";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<PrivateRoute />}>
          <Route path="/app" element={<MainLayout />}>
            <Route path="home" element={<Home />} />
            <Route path="journals" element={<JournalEntries />} />
            <Route path="journals/view/:id" element={<JournalEntryView />} />
            <Route path="journals/create" element={<JournalEntryCreate />} />
            <Route path="journals/edit/:id" element={<JournalEntryEdit />} />
            <Route path="profile" element={<Profile />} />
            <Route path="emotion-history" element={<EmotionHistory />} />
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

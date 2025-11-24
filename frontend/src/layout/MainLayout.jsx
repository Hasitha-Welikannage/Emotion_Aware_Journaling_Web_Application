import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";    

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
    </div>
  );
}
export default MainLayout;

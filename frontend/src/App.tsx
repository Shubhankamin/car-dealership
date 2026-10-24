import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        {/* <Route
          path="/"
          element={<p className="p-8">Dashboard coming next</p>}
        /> */}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/" element={<DashboardPage />} />
    </Routes>
  );
}

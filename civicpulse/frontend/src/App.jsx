import { Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import Toast from "./components/Toast";
import AdminDashboard from "./pages/AdminDashboard";
import ComplaintDetail from "./pages/ComplaintDetail";
import FileComplaint from "./pages/FileComplaint";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyComplaints from "./pages/MyComplaints";
import Register from "./pages/Register";
import StatsDashboard from "./pages/StatsDashboard";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(window.__civicPulseToastTimer);
    window.__civicPulseToastTimer = window.setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home showToast={showToast} />} />
            <Route path="/stats" element={<StatsDashboard showToast={showToast} />} />
            <Route path="/login" element={<Login showToast={showToast} />} />
            <Route path="/register" element={<Register showToast={showToast} />} />
            <Route
              path="/file"
              element={
                <ProtectedRoute>
                  <FileComplaint showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-complaints"
              element={
                <ProtectedRoute>
                  <MyComplaints showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route path="/complaint/:id" element={<ComplaintDetail showToast={showToast} />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard showToast={showToast} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </PageTransition>
      </main>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

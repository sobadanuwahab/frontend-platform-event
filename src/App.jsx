import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import Home from "./pages/Home";
import VotingPage from "./pages/VotingPage";
import TicketPage from "./pages/TicketPage";
import JudgingPage from "./pages/JudgingPage";
import ResultsPage from "./pages/ResultsPage";
import DashboardPage from "./pages/admin/DashboardPage";

import ProtectedRoute from "./components/Common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* AUTH ROUTES (Tanpa Layout) */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* MAIN ROUTES dengan Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="results" element={<ResultsPage />} />

            {/* PROTECTED ROUTES */}
            <Route
              path="ticket"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <TicketPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="voting"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <VotingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="judging"
              element={
                <ProtectedRoute allowedRoles={["juri", "admin"]}>
                  <JudgingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center p-4">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                      404
                    </h1>
                    <p className="text-gray-600 mb-8">
                      Halaman tidak ditemukan
                    </p>
                    <a
                      href="/"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Kembali ke Beranda
                    </a>
                  </div>
                </div>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

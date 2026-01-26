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

// Import Admin Pages & Components
import DashboardPage from "./pages/admin/DashboardPage";
import OverviewTab from "./pages/admin/components/OverviewTab";
import EventsTab from "./pages/admin/components/EventsTab";
import UserManagementTab from "./pages/admin/components/UserManagement";
import TransactionsTab from "./pages/admin/components/TransactionsTab";
import TicketsTab from "./pages/admin/components/TicketsTab";
import HistoryTab from "./pages/admin/components/HistoryTab";
import SettingsTab from "./pages/admin/components/SettingsTab";

// Import Organizer Pages
import OrganizerPage from "./pages/organizer/OrganizerPage";
import Dashboard from "./pages/organizer/Dashboard";
import ParticipantsList from "./pages/organizer/participants";
import CreateParticipant from "./pages/organizer/participants/CreateParticipants";
import EditParticipant from "./pages/organizer/participants/EditParticipants";
import EventsList from "./pages/organizer/events";
import CreateEvent from "./pages/organizer/events/CreateEvent";
import EditEvent from "./pages/organizer/events/EditEvent";

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
            {/* Home biasa - Layout akan handle auto-redirect */}
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
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Kembali ke Beranda
                    </a>
                  </div>
                </div>
              }
            />
          </Route>

          {/* ADMIN ROUTES dengan Layout Khusus */}
          {/* OPTION 1: Gunakan route /admin/dashboard untuk kompatibilitas */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* OPTION 2: Route /admin dengan nested routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewTab />} />
            <Route path="events" element={<EventsTab />} />
            <Route path="users" element={<UserManagementTab />} />
            <Route path="transactions" element={<TransactionsTab />} />
            <Route path="tickets" element={<TicketsTab />} />
            <Route path="history" element={<HistoryTab />} />
            <Route path="settings" element={<SettingsTab />} />
          </Route>

          {/* ORGANIZER ROUTES dengan Layout Khusus */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <OrganizerPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="participants" element={<ParticipantsList />} />
            <Route path="participants/create" element={<CreateParticipant />} />
            <Route path="participants/edit/:id" element={<EditParticipant />} />
            <Route path="events" element={<EventsList />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="events/edit/:id" element={<EditEvent />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

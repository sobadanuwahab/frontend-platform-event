import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import Home from "./pages/guest/Home";
import VotingPage from "./pages/guest/VotingPage";
import TicketPage from "./pages/guest/TicketPage";
import ResultsPage from "./pages/guest/ResultsPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

import JudgingPage from "./pages/judge/JudgingPage";

// Import Judging Components (untuk outlet JudgingPage)
import ScoreForm from "./pages/judge/form/ScoreForm";
import RankingPage from "./pages/judge/RankingPage";
import CriteriaPage from "./pages/judge/CriteriaPage";

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

          {/* PUBLIC ROUTES (Tanpa auth) - hanya untuk guest */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* USER ROUTES dengan Layout Global - HANYA untuk role "user" */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="ticket"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <TicketPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="voting"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <VotingPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* JUDGING ROUTES dengan Layout Khusus (Dashboard Sendiri) - untuk "juri" dan "admin" */}
          <Route
            path="/judging"
            element={
              <ProtectedRoute allowedRoles={["juri", "admin"]}>
                <JudgingPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<ScoreForm />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route path="criteria" element={<CriteriaPage />} />
          </Route>

          {/* ADMIN ROUTES dengan Layout Khusus - HANYA untuk "admin" */}
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

          {/* Tambahkan route /admin/dashboard untuk kompatibilitas */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardPage>
                  <OverviewTab />
                </DashboardPage>
              </ProtectedRoute>
            }
          />

          {/* ORGANIZER ROUTES dengan Layout Khusus - HANYA untuk "organizer" */}
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

          {/* Global 404 untuk routes yang tidak ditangkap */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                  <p className="text-gray-300 mb-8">Halaman tidak ditemukan</p>
                  <a
                    href="/"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Kembali ke Beranda
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

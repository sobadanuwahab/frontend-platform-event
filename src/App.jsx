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

// Import Judging Components
import ScoreForm from "./pages/judge/form/ScoreForm";
import RankingPage from "./pages/judge/RankingPage";
import CriteriaPage from "./pages/judge/CriteriaPage";

// Import Admin Pages & Components
import DashboardPage from "./pages/admin/DashboardPage";
import OverviewTab from "./pages/admin/components/OverviewTab";
import UserManagementTab from "./pages/admin/components/UserManagement";
import TransactionsTab from "./pages/admin/components/TransactionsTab";
import TicketsTab from "./pages/admin/components/TicketsTab";
import HistoryTab from "./pages/admin/components/HistoryTab";
import SettingsTab from "./pages/admin/components/SettingsTab";

// Import Event Management Components untuk Admin
import EventsList from "./pages/admin/components/events/index";
import CreateEvent from "./pages/admin/components/events/CreateEvent";
import EditEvent from "./pages/admin/components/events/EditEvent";
import CreateAssignment from "./pages/admin/components/events/CreateAssignment";

// Import Organizer Pages
import OrganizerPage from "./pages/organizer/OrganizerPage";
import Dashboard from "./pages/organizer/Dashboard";

// Import Participants
import ParticipantsIndex from "./pages/organizer/participants"; // Halaman pilih event
import CreateParticipant from "./pages/organizer/participants/CreateParticipants";
import EditParticipant from "./pages/organizer/participants/EditParticipants";

// Import Organizer Menu Pages
import DocumentsPage from "./pages/organizer/documents/DocumentsPage";
import ReportsPage from "./pages/organizer/reports/ReportsPage";
import OrganizerSettings from "./pages/organizer/settings/OrganizerSettings";

import ProtectedRoute from "./components/Common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* AUTH ROUTES */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* USER ROUTES */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Layout />
              </ProtectedRoute>
            }>
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

          {/* JUDGING ROUTES */}
          <Route
            path="/judging"
            element={
              <ProtectedRoute allowedRoles={["juri", "admin"]}>
                <JudgingPage />
              </ProtectedRoute>
            }>
            <Route index element={<ScoreForm />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route path="criteria" element={<CriteriaPage />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardPage />
              </ProtectedRoute>
            }>
            {/* Main Dashboard */}
            <Route index element={<OverviewTab />} />
            <Route path="dashboard" element={<OverviewTab />} />

            {/* Event Management */}
            <Route path="events">
              <Route index element={<EventsList />} />
              <Route path="list" element={<EventsList />} />
              <Route path="create" element={<CreateEvent />} />
              <Route path="edit/:id" element={<EditEvent />} />
              <Route path="assign/:eventId" element={<CreateAssignment />} />
            </Route>

            {/* Other Admin Routes */}
            <Route path="users" element={<UserManagementTab />} />
            <Route path="transactions" element={<TransactionsTab />} />
            <Route path="tickets" element={<TicketsTab />} />
            <Route path="history" element={<HistoryTab />} />
            <Route path="settings" element={<SettingsTab />} />
          </Route>

          {/* ORGANIZER ROUTES - STRUKTUR YANG BENAR */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <OrganizerPage />
              </ProtectedRoute>
            }>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Halaman pertama: Pilih Event */}
            <Route path="participants" element={<ParticipantsIndex />} />

            {/* Routes untuk Event tertentu */}
            <Route path="events/:eventId">
              {/* Daftar peserta di event tertentu */}
              <Route path="participants" element={<ParticipantsIndex />} />
              {/* Tambah peserta baru */}
              <Route
                path="participants/create"
                element={<CreateParticipant />}
              />
              {/* Edit peserta */}
              <Route
                path="participants/edit/:id"
                element={<EditParticipant />}
              />
            </Route>

            {/* Organizer Menu Routes */}
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<OrganizerSettings />} />
          </Route>

          {/* Global 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                  <p className="text-gray-300 mb-8">Halaman tidak ditemukan</p>
                  <a
                    href="/"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

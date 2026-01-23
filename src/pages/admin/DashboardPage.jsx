import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart,
  Users,
  CreditCard,
  Vote,
  Ticket as TicketIcon,
  Shield,
  RefreshCw,
  BarChart3,
} from "lucide-react";

import OverviewTab from "./components/OverviewTab";
import ParticipantsTab from "./components/ParticipantsTab";
import UserManagementTab from "./components/UserManagement";
import TransactionsTab from "./components/TransactionsTab";
import VotingTab from "./components/VotingTab";
import TicketsTab from "./components/TicketsTab";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState({
    totalUsers: 10,
    totalCoinsSold: 1500,
    totalTicketSold: 500,
    totalVotes: 56800,
    revenue: 25450000,
    activeUsers: 10,
    pendingTransactions: 5,
    completedTransaction: 25,
    completedTransactions: 250,
    totalParticipants: 5,
    activeParticipants: 4,
    pendingParticipants: 1,
  });

  // Cek role admin
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      alert("Hanya admin yang dapat mengakses dashboard!");
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4">
            <p className="text-gray-600">Memuat dashboard...</p>
          </RefreshCw>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-600 mb-6">
            Hanya admin yang dapat mengakases halaman ini
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Tabs configuration
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 size={18} />,
    },
    {
      id: "participants",
      label: "Peserta",
      icon: <Users size={18} />,
    },
    {
      id: "users",
      label: "User Management",
      icon: <CreditCard size={18} />,
    },
    {
      id: "transactions",
      label: "Data Voting",
      icon: <Vote size={18} />,
    },
    {
      id: "tickets",
      label: "Data Tiket",
      icon: <TicketIcon size={18} />,
    },
  ];

  // Render content based on active
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab stats={stats} formatCurrency={formatCurrency} />;
      case "participants":
        return <ParticipantsTab stats={stats} />;
      case "users":
        return <UserManagementTab stats={stats} setStats={setStats} />;
      case "transactions":
        return (
          <TransactionsTab
            stats={stats}
            setStats={setStats}
            formatCurrency={formatCurrency}
          />
        );
      case "voting":
        return <VotingTab stats={stats} formatCurrency={formatCurrency} />;
      case "tickets":
        return <TicketsTab stats={stats} formatCurrency={formatCurrency} />;
      default:
        return <OverviewTab stats={stats} formatCurrency={formatCurrency} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola data voting, tiket, dan user management
            </p>
          </div>
          {/* <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="font-medium text-gray-900">
                {user?.name || "Admin"}
              </p>
              <p className="text-sm text-gray-500">Role: {user?.role}</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium flex items-center gap-2 transition-colors ${activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}

      {/* Security Warning */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">Keamanan Dashboard</h4>
            <p className="text-sm text-gray-600 mt-1">
              Dashboard ini hanya dapat diakses oleh admin. Pastikan untuk
              logout setelah menggunakan dashboard dan jangan membagikan akses
              Anda kepada siapapun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

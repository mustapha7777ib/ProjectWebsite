import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalArtisans: 0,
    averageRating: 0,
    totalJobPostings: 0,
  });
  const [activities, setActivities] = useState({
    coinPurchases: [],
    deals: [],
    messages: [],
    recentSignups: [],
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [signupTrends, setSignupTrends] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchAdminData = async () => {
    setIsLoading(true);
    let newMetrics = { ...metrics };
    let newActivities = { ...activities };
    let newAuditLogs = [];
    let newSignupTrends = [];
    let errorMessages = [];

    try {
      const usersResponse = await fetch("http://localhost:8080/api/admin/users", {
        credentials: "include",
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        newMetrics.totalUsers = usersData.total;
      } else {
        errorMessages.push(`Users: ${usersResponse.statusText} (${usersResponse.status})`);
      }

      const artisansResponse = await fetch("http://localhost:8080/api/admin/artisans", {
        credentials: "include",
      });
      if (artisansResponse.ok) {
        const artisansData = await artisansResponse.json();
        newMetrics.totalArtisans = artisansData.total;
      } else {
        errorMessages.push(`Artisans: ${artisansResponse.statusText} (${artisansResponse.status})`);
      }

      // Fetch stats
      const statsResponse = await fetch("http://localhost:8080/api/admin/stats", {
        credentials: "include",
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        newMetrics.averageRating = statsData.averageRating || 0;
        newMetrics.totalJobPostings = statsData.totalJobPostings || 0;
      } else {
        errorMessages.push(`Stats: ${statsResponse.statusText} (${statsResponse.status})`);
      }

      // Fetch activities
      const coinPurchasesResponse = await fetch("http://localhost:8080/api/admin/coin-purchases", {
        credentials: "include",
      });
      if (coinPurchasesResponse.ok) {
        const coinPurchasesData = await coinPurchasesResponse.json();
        newActivities.coinPurchases = coinPurchasesData.slice(0, 10);
      } else {
        errorMessages.push(`Coin Purchases: ${coinPurchasesResponse.statusText} (${coinPurchasesResponse.status})`);
      }

      const dealsResponse = await fetch("http://localhost:8080/api/admin/deals", {
        credentials: "include",
      });
      if (dealsResponse.ok) {
        const dealsData = await dealsResponse.json();
        newActivities.deals = dealsData.slice(0, 10);
      } else {
        errorMessages.push(`Deals: ${dealsResponse.statusText} (${dealsResponse.status})`);
      }

      const messagesResponse = await fetch("http://localhost:8080/api/admin/messages", {
        credentials: "include",
      });
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        newActivities.messages = messagesData.slice(0, 10);
      } else {
        errorMessages.push(`Messages: ${messagesResponse.statusText} (${messagesResponse.status})`);
      }

      const signupsResponse = await fetch("http://localhost:8080/api/admin/recent-signups", {
        credentials: "include",
      });
      if (signupsResponse.ok) {
        const signupsData = await signupsResponse.json();
        newActivities.recentSignups = signupsData;
      } else {
        errorMessages.push(`Signups: ${signupsResponse.statusText} (${signupsResponse.status})`);
      }

      // Fetch audit logs
      const auditLogsResponse = await fetch("http://localhost:8080/api/admin/audit-logs", {
        credentials: "include",
      });
      if (auditLogsResponse.ok) {
        newAuditLogs = await auditLogsResponse.json();
      } else {
        errorMessages.push(`Audit Logs: ${auditLogsResponse.statusText} (${auditLogsResponse.status})`);
      }

      // Fetch signup trends
      const trendsResponse = await fetch(`http://localhost:8080/api/admin/signup-trends?range=${timeRange}&role=${roleFilter}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (trendsResponse.ok) {
        newSignupTrends = (await trendsResponse.json()).map(trend => ({
          date: trend.date,
          count: parseInt(trend.count) || 0,
        }));
        if (newSignupTrends.length === 0) {
          console.warn("AdminDashboard.jsx: Signup trends empty");
        }
        console.log("AdminDashboard.jsx: Signup trends data:", newSignupTrends);
        const expectedDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const endDate = new Date();
        endDate.setUTCHours(23, 59, 59, 999);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - expectedDays);
        const filledTrends = [];
        for (let i = 0; i <= expectedDays; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          const trend = newSignupTrends.find(t => t.date === dateStr) || { date: dateStr, count: 0 };
          filledTrends.push(trend);
        }
        newSignupTrends = filledTrends;
        console.log("AdminDashboard.jsx: Filled signup trends:", newSignupTrends);
      } else {
        console.error("AdminDashboard.jsx: Trends fetch failed:", trendsResponse.status, await trendsResponse.text());
        errorMessages.push(`Signup Trends: ${trendsResponse.statusText} (${trendsResponse.status})`);
        newSignupTrends = [];
      }

      setMetrics(newMetrics);
      setActivities(newActivities);
      setAuditLogs(newAuditLogs);
      setSignupTrends(newSignupTrends);
      setError(errorMessages.length > 0 ? `Failed to load some data: ${errorMessages.join("; ")}` : "");
      setLastUpdated(new Date());
    } catch (err) {
      console.error("AdminDashboard.jsx: Error fetching admin data:", err.message);
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      console.log("AdminDashboard.jsx: Unauthorized access, redirecting to signin");
      navigate("/signin");
      return;
    }
    fetchAdminData();
  }, [user, authLoading, navigate, timeRange, roleFilter]);

  const handleBanUser = async (userId) => {
    if (window.confirm("Are you sure you want to ban this user?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/ban`, {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) {
          alert("User banned successfully");
          fetchAdminData();
        } else {
          setError("Failed to ban user");
        }
      } catch (err) {
        setError(`Error banning user: ${err.message}`);
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedUser),
      });
      if (response.ok) {
        setShowEditModal(false);
        fetchAdminData();
      } else {
        setError("Failed to update user");
      }
    } catch (err) {
      setError(`Error updating user: ${err.message}`);
    }
  };

  const exportToCSV = (data, filename, type) => {
    let headers, rows;
    switch (type) {
      case "signups":
        headers = ["User,Email,Role,Signup Date"];
        rows = data.map((item) =>
          `${item.first_name} ${item.last_name},${item.email},${item.role},${new Date(item.created_at).toLocaleString()}`
        );
        break;
      case "coinPurchases":
        headers = ["Artisan,Coins,Amount (NGN),Date"];
        rows = data.map((item) =>
          `${item.firstname} ${item.lastname},${item.coin_amount},${item.amount / 100},${new Date(item.created_at).toLocaleString()}`
        );
        break;
      case "deals":
        headers = ["User,Artisan,Coins Deducted,Date"];
        rows = data.map((item) =>
          `${item.user_first_name} ${item.user_last_name},${item.artisan_firstname} ${item.artisan_lastname},${item.coins_deducted || 25},${new Date(item.created_at).toLocaleString()}`
        );
        break;
      case "messages":
        headers = ["Sender,Receiver,Message,Date"];
        rows = data.map((item) =>
          `${item.sender_first_name} ${item.sender_last_name},${item.receiver_first_name} ${item.receiver_last_name},${item.content.substring(0, 50)},${new Date(item.timestamp).toLocaleString()}`
        );
        break;
      case "auditLogs":
        headers = ["Admin,Action,Date"];
        rows = data.map((item) => `${item.admin},${item.action},${new Date(item.timestamp).toLocaleString()}`);
        break;
      default:
        return;
    }
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const chartData = {
    labels: signupTrends.map((trend) => trend.date),
    datasets: [
      {
        label: "User Signups",
        data: signupTrends.map((trend) => Number(trend.count)),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `User Signup Trends (${roleFilter === 'all' ? 'All Roles' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)})`,
      },
    },
  };

  // Pagination logic
  const filteredSignups = activities.recentSignups
    .filter((signup) =>
      `${signup.first_name} ${signup.last_name} ${signup.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((signup) => roleFilter === "all" || signup.role === roleFilter);
  const totalPages = Math.ceil(filteredSignups.length / itemsPerPage);
  const paginatedSignups = filteredSignups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (authLoading || isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <div className="refresh-section">
        <button onClick={fetchAdminData}>Refresh Now</button>
        {lastUpdated && <p>Last Updated: {lastUpdated.toLocaleString()}</p>}
      </div>
      {error && <p className="error-message">{error}</p>}

      <div className="metrics-grid">
        <div className="metric-card">
          <h2 className="metric-title">Total Users</h2>
          <p className="metric-value">{metrics.totalUsers}</p>
        </div>
        <div className="metric-card">
          <h2 className="metric-title">Total Artisans</h2>
          <p className="metric-value">{metrics.totalArtisans}</p>
        </div>
        <div className="metric-card">
          <h2 className="metric-title">Average Artisan Rating</h2>
          <p className="metric-value">{metrics.averageRating.toFixed(1)}/5</p>
        </div>
        <div className="metric-card">
          <h2 className="metric-title">Total Job Postings</h2>
          <p className="metric-value">{metrics.totalJobPostings}</p>
        </div>
      </div>

      <div className="analytics-section">
        <h2 className="section-title">Analytics</h2>
        <div className="filters">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="artisan">Artisans</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="activities-section">
        <div className="activity-table">
          <h2 className="table-title">Recent Coin Purchases</h2>
          <button onClick={() => exportToCSV(activities.coinPurchases, "coin_purchases.csv", "coinPurchases")}>
            Export to CSV
          </button>
          {activities.coinPurchases.length === 0 ? (
            <p>No recent coin purchases.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Artisan</th>
                  <th>Coins</th>
                  <th>Amount (NGN)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.coinPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>
                      {purchase.firstname} {purchase.lastname}
                    </td>
                    <td>{purchase.coin_amount}</td>
                    <td>{purchase.amount / 100}</td>
                    <td>{new Date(purchase.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="activity-table">
          <h2 className="table-title">Recent Confirmed Deals</h2>
          <button onClick={() => exportToCSV(activities.deals, "deals.csv", "deals")}>
            Export to CSV
          </button>
          {activities.deals.length === 0 ? (
            <p>No recent deals.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Artisan</th>
                  <th>Coins Deducted</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.deals.map((deal) => (
                  <tr key={deal.id}>
                    <td>
                      {deal.user_first_name} {deal.user_last_name}
                    </td>
                    <td>
                      {deal.artisan_firstname} {deal.artisan_lastname}
                    </td>
                    <td>{deal.coins_deducted || 25}</td>
                    <td>{new Date(deal.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="activity-table">
          <h2 className="table-title">Recent Messages</h2>
          <button onClick={() => exportToCSV(activities.messages, "messages.csv", "messages")}>
            Export to CSV
          </button>
          {activities.messages.length === 0 ? (
            <p>No recent messages.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.messages.map((msg) => (
                  <tr key={msg.id}>
                    <td>
                      {msg.sender_first_name} {msg.sender_last_name}
                      {msg.sender_role === "artisan" && " (Artisan)"}
                    </td>
                    <td>
                      {msg.receiver_first_name} {msg.receiver_last_name}
                      {msg.receiver_role === "artisan" && " (Artisan)"}
                    </td>
                    <td>{msg.content.substring(0, 50)}...</td>
                    <td>{new Date(msg.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="activity-table">
          <h2 className="table-title">Recent User Signups</h2>
          <div className="filters">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="artisan">Artisan</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={() => exportToCSV(filteredSignups, "user_signups.csv", "signups")}>
              Export to CSV
            </button>
          </div>
          {paginatedSignups.length === 0 ? (
            <p>No recent signups.</p>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Signup Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSignups.map((signup) => (
                    <tr key={signup.id}>
                      <td>
                        {signup.first_name} {signup.last_name}
                      </td>
                      <td>{signup.email}</td>
                      <td>{signup.role}</td>
                      <td>{new Date(signup.created_at).toLocaleString()}</td>
                      <td>
                        <button onClick={() => handleEditUser(signup)}>Edit</button>
                        <button onClick={() => handleBanUser(signup.id)}>Ban</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        <div className="activity-table">
          <h2 className="table-title">Audit Logs</h2>
          <button onClick={() => exportToCSV(auditLogs, "audit_logs.csv", "auditLogs")}>
            Export to CSV
          </button>
          {auditLogs.length === 0 ? (
            <p>No audit logs available.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.admin}</td>
                    <td>{log.action}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showEditModal && selectedUser && (
        <div className="modal">
          <h2>Edit User</h2>
          <input
            type="text"
            value={selectedUser.first_name}
            onChange={(e) => setSelectedUser({ ...selectedUser, first_name: e.target.value })}
          />
          <input
            type="text"
            value={selectedUser.last_name}
            onChange={(e) => setSelectedUser({ ...selectedUser, last_name: e.target.value })}
          />
          <input
            type="email"
            value={selectedUser.email}
            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
          />
          <select
            value={selectedUser.role}
            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="artisan">Artisan</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleSaveUser}>Save</button>
          <button onClick={() => setShowEditModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
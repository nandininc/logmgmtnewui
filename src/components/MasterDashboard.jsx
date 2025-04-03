import React, { useState, useEffect } from 'react';
import { inspectionFormAPI } from './api';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const MasterDashboard = ({ user, onLogout }) => {
  const [pendingForms, setPendingForms] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [metrics, setMetrics] = useState({
    approvedToday: 0,
    avgApprovalTime: 0,
    qualityIssues: 0,
    complianceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // <-- controls visible section

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const submittedForms = await inspectionFormAPI.getFormsByStatus('SUBMITTED');
        setPendingForms(submittedForms);

        const allForms = await inspectionFormAPI.getAllForms();
        const sortedForms = [...allForms].sort((a, b) => {
          const dateA = a.reviewedAt || a.submittedAt || new Date(0);
          const dateB = b.reviewedAt || b.submittedAt || new Date(0);
          return new Date(dateB) - new Date(dateA);
        });
        setRecentActivity(sortedForms.slice(0, 5));
        calculateMetrics(allForms);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateMetrics = (forms) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const approvedToday = forms.filter(form => {
        if (!form.reviewedAt || form.status !== 'APPROVED') return false;
        const reviewDate = new Date(form.reviewedAt);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === today.getTime();
      }).length;

      const approvedForms = forms.filter(form =>
        form.status === 'APPROVED' && form.submittedAt && form.reviewedAt
      );

      let totalApprovalTime = 0;
      approvedForms.forEach(form => {
        const submittedTime = new Date(form.submittedAt).getTime();
        const reviewedTime = new Date(form.reviewedAt).getTime();
        const diffHours = (reviewedTime - submittedTime) / (1000 * 60 * 60);
        totalApprovalTime += diffHours;
      });

      const avgTime = approvedForms.length > 0
        ? (totalApprovalTime / approvedForms.length).toFixed(1)
        : 0;

      const qualityIssues = forms.filter(form => form.status === 'REJECTED').length;
      const decidedForms = forms.filter(form =>
        form.status === 'APPROVED' || form.status === 'REJECTED'
      );

      const complianceRate = decidedForms.length > 0
        ? ((decidedForms.length - qualityIssues) / decidedForms.length * 100).toFixed(1)
        : 100;

      setMetrics({
        approvedToday,
        avgApprovalTime: avgTime,
        qualityIssues,
        complianceRate,
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
      setMetrics({
        approvedToday: 0,
        avgApprovalTime: 0,
        qualityIssues: 0,
        complianceRate: 0,
      });
    }
  };

  const getActivityDescription = (form) => {
    if (form.status === 'APPROVED') return `Document No. ${form.documentNo} approved`;
    if (form.status === 'REJECTED') return `Document No. ${form.documentNo} rejected`;
    if (form.status === 'SUBMITTED') return `Document No. ${form.documentNo} submitted for approval`;
    return `Document No. ${form.documentNo} created`;
  };

  const getActivityPerson = (form) => {
    if (form.status === 'APPROVED' || form.status === 'REJECTED') return `By ${form.reviewedBy}`;
    if (form.status === 'SUBMITTED') return `By ${form.submittedBy}`;
    return `By ${form.productionOperator || 'Unknown'}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-4">
          <li>
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-indigo-300">
              Dashboard
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('forms')} className="hover:text-indigo-300">
              All Forms
            </button>
          </li>
          <li>
            <button onClick={onLogout} className="hover:text-red-400">
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Top Navbar */}
        <div className="bg-gray-100 shadow px-6 py-4 flex justify-between items-center ">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {activeTab === 'dashboard' ? 'Master Dashboard' : 'All Forms'}
            </h1>
            <p className="text-sm text-gray-500">Welcome, {user?.name || 'Admin Manager'}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-sm bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Content switcher */}
        <div className="p-6 flex-1 overflow-auto">
          {loading ? (
            <div className="text-center text-gray-500">Loading data...</div>
          ) : activeTab === 'dashboard' ? (
            <>
              {/* Dashboard Metrics */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white p-4 rounded shadow">
                  <h2 className="text-lg font-bold mb-4">Reports Pending Approval</h2>
                  {pendingForms.length === 0 ? (
                    <p className="text-gray-500 text-center">No pending forms</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {pendingForms.slice(0, 5).map((form) => (
                        <li key={form.id} className="py-3">
                          <p className="text-sm font-medium text-gray-800">{form.documentNo}</p>
                          <p className="text-sm text-gray-500">{form.variant} - {form.lineNo} - {form.product}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h2 className="text-lg font-bold mb-4">Quality Metrics</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Approved Today</p>
                      <p className="text-xl font-bold">{metrics.approvedToday}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg Approval Time</p>
                      <p className="text-xl font-bold">{metrics.avgApprovalTime}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quality Issues</p>
                      <p className="text-xl font-bold">{metrics.qualityIssues}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Compliance Rate</p>
                      <p className="text-xl font-bold">{metrics.complianceRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="mt-6 bg-white p-4 rounded shadow">
                <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center">No recent activity</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {recentActivity.map((form) => (
                      <li key={form.id} className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium">{getActivityDescription(form)}</p>
                            <p className="text-sm text-gray-500">{getActivityPerson(form)}</p>
                          </div>
                          <p className="text-sm text-gray-400">
                            {formatTimestamp(form.reviewedAt || form.submittedAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Dummy All Forms Section (you can expand this later) */}
              <div className="bg-white p-6 rounded shadow text-center text-gray-600">
                <h2 className="text-lg font-bold mb-2">All Forms View</h2>
                <p>You can add detailed form list or search features here.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;

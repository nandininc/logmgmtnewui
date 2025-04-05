import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionFormAPI } from './api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const MasterDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [allForms, setAllForms] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const allFormsData = await inspectionFormAPI.getAllForms();
      setAllForms(allFormsData);
      calculateMetrics(allFormsData);
      prepareChartData(allFormsData);
    } catch (err) {
      console.error('Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (forms) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const approvedForms = forms.filter(f => f.status === 'APPROVED');
    const approvedToday = approvedForms.filter(f => new Date(f.reviewedAt).toDateString() === today.toDateString()).length;
    const totalApprovalTime = approvedForms.reduce((acc, f) => acc + ((new Date(f.reviewedAt) - new Date(f.submittedAt)) / 36e5), 0);
    const qualityIssues = forms.filter(f => f.status === 'REJECTED').length;
    const decidedForms = forms.filter(f => ['APPROVED', 'REJECTED'].includes(f.status)).length;
    const complianceRate = decidedForms > 0 ? ((decidedForms - qualityIssues) / decidedForms * 100).toFixed(1) : 100;
    setMetrics({
      approvedToday,
      avgApprovalTime: approvedForms.length ? (totalApprovalTime / approvedForms.length).toFixed(1) : 0,
      qualityIssues,
      complianceRate,
      totalForms: forms.length,
      approvedForms: approvedForms.length,
      rejectedForms: qualityIssues,
      pendingForms: forms.filter(f => f.status === 'SUBMITTED').length
    });
  };

  const prepareChartData = (forms) => {
    const today = new Date();
    const last6Months = [];
    const monthlySubmissions = Array(6).fill(0);
    const monthlyApprovals = Array(6).fill(0);

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      last6Months.push(date.toLocaleString('default', { month: 'short' }));
    }

    forms.forEach(form => {
      const submittedDate = new Date(form.submittedAt);
      const reviewedDate = new Date(form.reviewedAt);

      let subIndex = 5 - ((today.getMonth() - submittedDate.getMonth()) + 12 * (today.getFullYear() - submittedDate.getFullYear()));
      if (form.submittedAt && subIndex >= 0 && subIndex < 6) monthlySubmissions[subIndex]++;

      let revIndex = 5 - ((today.getMonth() - reviewedDate.getMonth()) + 12 * (today.getFullYear() - reviewedDate.getFullYear()));
      if (form.reviewedAt && form.status === 'APPROVED' && revIndex >= 0 && revIndex < 6) monthlyApprovals[revIndex]++;
    });

    const statusCounts = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].reduce((acc, status) => {
      acc[status] = forms.filter(f => (f.status || '').toUpperCase().trim() === status).length;
      return acc;
    }, {});

    const variants = {};
    forms.forEach(f => {
      if (f.variant) variants[f.variant] = (variants[f.variant] || 0) + 1;
    });

    setChartData({
      statusCounts,
      last6Months,
      monthlySubmissions,
      monthlyApprovals,
      variantLabels: Object.keys(variants),
      variantCounts: Object.values(variants)
    });
  };

  const handleViewForm = (formId) => navigate(`/inspection-form/${formId}`);

  const getStatusClass = (status) => {
    const key = (status || '').toUpperCase().trim();
    return {
      DRAFT: 'text-gray-600',
      SUBMITTED: 'text-blue-600',
      APPROVED: 'text-green-600',
      REJECTED: 'text-red-600'
    }[key] || 'text-gray-600';
  };


  const filteredForms = allForms.filter(form => {
    if (filterStatus !== 'all' && form.status !== filterStatus) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      form.documentNo?.toLowerCase().includes(q) ||
      form.variant?.toLowerCase().includes(q) ||
      form.product?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow z-50 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {activeTab === 'dashboard' ? 'Dashboard' : 'All Forms'}
        </h1>
        <div className="space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-4 py-2 rounded ${activeTab === 'forms' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All Forms
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content with padding to avoid being under nav */}
      <div className="pt-24 px-6 pb-6">
        {loading ? (
          <p>Loading...</p>
        ) : activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metrics).map(([key, val]) => (
                <div key={key} className="bg-white p-4 shadow rounded">
                  <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-xl font-bold">{val}</p>
                </div>
              ))}
            </div>

            {chartData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 shadow rounded">
                  <h3 className="font-semibold mb-4">Form Status</h3>

                  {(() => {
                    const statusOrder = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];
                    const statusColors = {
                      DRAFT: '#D1D5DB',
                      SUBMITTED: '#60A5FA',
                      APPROVED: '#34D399',
                      REJECTED: '#F87171',
                    };
                    const pieData = {
                      labels: statusOrder,
                      datasets: [{
                        data: statusOrder.map(status => chartData.statusCounts[status] || 0),
                        backgroundColor: statusOrder.map(status => statusColors[status])
                      }]
                    };

                    return <Pie data={pieData} />;
                  })()}
                </div>

                <div className="bg-white p-4 shadow rounded">
                  <h3 className="font-semibold mb-4">Monthly Trends</h3>
                  <Line
                    data={{
                      labels: chartData.last6Months,
                      datasets: [
                        { label: 'Submissions', data: chartData.monthlySubmissions, borderColor: '#60A5FA', fill: false },
                        { label: 'Approvals', data: chartData.monthlyApprovals, borderColor: '#34D399', fill: false }
                      ]
                    }}
                  />
                </div>
              </div>


            )}
          </div>
        ) : (
          <div className="bg-white p-4 rounded shadow">
            <div className="mb-4 flex items-center">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border px-3 py-2 mr-4 rounded w-1/2"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="all">All</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Document No</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Variant</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.map((f) => (
                  <tr key={f.id} className="border-t">
                    <td className="p-2">{f.documentNo}</td>
                    <td className="p-2">{f.product}</td>
                    <td className="p-2">{f.variant}</td>
                    <td className={`p-2 font-medium ${getStatusClass(f.status)}`}>{f.status}</td>
                    <td className="p-2">
                      <button onClick={() => handleViewForm(f.id)} className="text-blue-600 hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterDashboard;

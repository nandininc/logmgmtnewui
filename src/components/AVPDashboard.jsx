import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionFormAPI } from './api';

const AVPDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [pendingForms, setPendingForms] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [metrics, setMetrics] = useState({
    approvedToday: 0,
    avgApprovalTime: 0,
    qualityIssues: 0,
    complianceRate: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch forms pending approval
        const submittedForms = await inspectionFormAPI.getFormsByStatus('SUBMITTED');
        setPendingForms(submittedForms);
        
        // Fetch recent form activity
        const allForms = await inspectionFormAPI.getAllForms();
        
        // Sort forms by most recently updated
        const sortedForms = [...allForms].sort((a, b) => {
          const dateA = a.reviewedAt || a.submittedAt || new Date(0);
          const dateB = b.reviewedAt || b.submittedAt || new Date(0);
          return new Date(dateB) - new Date(dateA);
        });
        
        setRecentActivity(sortedForms.slice(0, 5)); // Get only the 5 most recent
        
        // Calculate metrics
        calculateMetrics(allForms);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Calculate dashboard metrics
  const calculateMetrics = (forms) => {
    try {
      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Forms approved today
      const approvedToday = forms.filter(form => {
        if (!form.reviewedAt || form.status !== 'APPROVED') return false;
        const reviewDate = new Date(form.reviewedAt);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === today.getTime();
      }).length;
      
      // Calculate average approval time (in hours)
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
      
      // Count quality issues (rejected forms)
      const qualityIssues = forms.filter(form => form.status === 'REJECTED').length;
      
      // Calculate compliance rate
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
        complianceRate
      });
      
    } catch (error) {
      console.error('Error calculating metrics:', error);
      // Set default values if calculation fails
      setMetrics({
        approvedToday: 0,
        avgApprovalTime: 0,
        qualityIssues: 0,
        complianceRate: 0
      });
    }
  };
  
  // Handle navigation to review a form
  const handleReviewForm = (formId) => {
    navigate(`/inspection-form/${formId}`);
  };
  
  // Handle navigation to all forms
  const handleViewAllForms = () => {
    navigate('/forms');
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 24) {
      // Show as hours ago
      const hours = Math.floor(diffHrs);
      return hours === 0 ? 'Just now' : `${hours}h ago`;
    } else {
      // Show as date
      return date.toLocaleDateString();
    }
  };
  
  // Get activity description
  const getActivityDescription = (form) => {
    if (form.status === 'APPROVED') {
      return `Document No. ${form.documentNo} approved`;
    } else if (form.status === 'REJECTED') {
      return `Document No. ${form.documentNo} rejected`;
    } else if (form.status === 'SUBMITTED') {
      return `Document No. ${form.documentNo} submitted for approval`;
    } else {
      return `Document No. ${form.documentNo} created`;
    }
  };
  
  // Get the person who performed the action
  const getActivityPerson = (form) => {
    if (form.status === 'APPROVED' || form.status === 'REJECTED') {
      return `By ${form.reviewedBy}`;
    } else if (form.status === 'SUBMITTED') {
      return `By ${form.submittedBy}`;
    } else {
      return `By ${form.productionOperator || 'Unknown'}`;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-red-300 shadow fixed top: 0 w-full">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="font-bold text-2xl">AGI</div>
            <div className="ml-2 text-sm font-bold">GREENPAC</div>
          </div>
          <div className="flex items-center">
            <span className="mr-4">Welcome, {user.name}</span>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">AVP Dashboard</h1>
          <p className="mt-2 text-gray-600">Quality Assurance & Systems Management</p>
        </div>
        
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading dashboard data...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Reports Pending Approval</h3>
                    <button
                      onClick={handleViewAllForms}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View All
                    </button>
                  </div>
                  <div className="mt-4">
                    {pendingForms.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No reports pending approval
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {pendingForms.slice(0, 5).map(form => (
                          <li key={form.id} className="py-3 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{form.documentNo}</p>
                              <p className="text-sm text-gray-500">
                                {form.variant} - Line {form.lineNo} - {form.product}
                              </p>
                            </div>
                            <button
                              onClick={() => handleReviewForm(form.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Review
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Quality Metrics</h3>
                  <div className="mt-4">
                    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="bg-gray-50 overflow-hidden shadow rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500 truncate">Reports Approved Today</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.approvedToday}</dd>
                      </div>
                      <div className="bg-gray-50 overflow-hidden shadow rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500 truncate">Average Approval Time</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.avgApprovalTime}h</dd>
                      </div>
                      <div className="bg-gray-50 overflow-hidden shadow rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500 truncate">Quality Issues Reported</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.qualityIssues}</dd>
                      </div>
                      <div className="bg-gray-50 overflow-hidden shadow rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500 truncate">Compliance Rate</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{metrics.complianceRate}%</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <div className="mt-4 border-t border-gray-200 pt-4">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No recent activity
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {recentActivity.map(form => (
                        <li key={form.id} className="py-3">
                          <div className="flex space-x-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">{getActivityDescription(form)}</h3>
                                <p className="text-sm text-gray-500">{formatTimestamp(form.reviewedAt || form.submittedAt)}</p>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-sm text-gray-500">{getActivityPerson(form)}</p>
                                <button
                                  onClick={() => handleReviewForm(form.id)}
                                  className="text-xs text-indigo-600 hover:text-indigo-900"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AVPDashboard;
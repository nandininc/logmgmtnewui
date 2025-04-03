import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionFormAPI } from './api';
import { DashboardLayout, StatusBadge, formatDate } from './SharedComponents';

const QADashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [pendingForms, setPendingForms] = useState([]);
  const [recentForms, setRecentForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        
        // Fetch submitted forms awaiting QA review
        const pendingResponse = await inspectionFormAPI.getFormsByStatus('SUBMITTED');
        setPendingForms(pendingResponse);
        
        // Fetch recently approved/rejected forms
        const recentResponse = await inspectionFormAPI.getAllForms();
        const recent = recentResponse.filter(form => 
          (form.status === 'APPROVED' || form.status === 'REJECTED') && form.reviewedAt
        );
        
        // Sort by review date
        const sortedRecent = recent.sort((a, b) => 
          new Date(b.reviewedAt) - new Date(a.reviewedAt)
        );
        
        setRecentForms(sortedRecent.slice(0, 5));
        setError(null);
      } catch (error) {
        console.error("Error fetching form data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, []);
  
  const handleReviewForm = (formId) => {
    navigate(`/inspection-form/${formId}`);
  };
  
  const handleViewAllForms = () => {
    navigate('/forms');
  };

  const handleGenerateReports = () => {
    navigate('/reports');
  };

  // Calculate refresh time
  const getRefreshTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  // Manually refresh data
  const handleRefreshData = async () => {
    setLoading(true);
    await fetchFormData();
  };

  return (
    <DashboardLayout 
      user={user} 
      onLogout={onLogout} 
      title="QA Dashboard" 
      subtitle="Review and verify inspection forms"
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading data...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          {error}
        </div>
      ) : (
        <>
          {/* Forms Pending Review */}
                    {/* QA Metrics */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Forms Reviewed Today</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{
                  recentForms.filter(form => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const reviewDate = new Date(form.reviewedAt);
                    reviewDate.setHours(0, 0, 0, 0);
                    return reviewDate.getTime() === today.getTime();
                  }).length
                }</dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Average Review Time</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">1.5h</dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Reviews</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{pendingForms.length}</dd>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Forms Pending Review</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Inspection forms awaiting quality verification</p>
              </div>
              <button
                onClick={handleViewAllForms}
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-md text-sm font-medium"
              >
                View All Forms
              </button>
            </div>
            
            {pendingForms.length > 0 ? (
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document No.</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingForms.map((form) => (
                        <tr key={form.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.documentNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(form.inspectionDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{form.product}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{form.variant}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{form.submittedBy}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleReviewForm(form.id)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6 text-center text-gray-500">
                No forms pending review
              </div>
            )}
          </div>
          

          {/* Recently Reviewed Forms */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recently Reviewed Forms</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest forms reviewed by QA personnel</p>
            </div>
            
            {recentForms.length > 0 ? (
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {recentForms.map((form) => (
                    <li key={form.id} className="py-4 px-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {form.documentNo}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <StatusBadge status={form.status} />
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {form.product} - {form.variant}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="mr-1">Reviewed on</span>
                          <time dateTime={form.reviewedAt}>
                            {formatDate(form.reviewedAt)}
                          </time>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Submitted by:</span> {form.submittedBy}
                        </p>
                        <button
                          onClick={() => handleReviewForm(form.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View Details
                        </button>
                      </div>
                      {form.comments && (
                        <div className="mt-2 text-sm text-gray-500">
                          <span className="font-medium">Comments:</span>{' '}
                          <span className="text-gray-700">{form.comments}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6 text-center text-gray-500">
                No recently reviewed forms
              </div>
            )}
          </div>
          
          {/* Data Refresh Indicator */}
          <div className="mt-4 text-right text-xs text-gray-500">
            <span>Last updated: {getRefreshTime()}</span>
            <button 
              onClick={handleRefreshData}
              className="ml-2 text-indigo-600 hover:text-indigo-800"
            >
              Refresh
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default QADashboard;
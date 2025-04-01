import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { inspectionFormAPI } from './api';

const InspectionFormList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data = [];
        
        // Filter based on user role
        if (user.role === 'operator') {
          // Operators see their own submissions
          data = await inspectionFormAPI.getFormsBySubmitter(user.name);
        } else if (user.role === 'qa' || user.role === 'avp') {
          // QA and AVP see submitted forms that need approval
          data = await inspectionFormAPI.getFormsByStatus('SUBMITTED');
        } else if (user.role === 'master') {
          // Masters see all forms
          data = await inspectionFormAPI.getAllForms();
        }
        
        setForms(data);
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError('Failed to load inspection forms. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchForms();
  }, [user]);

  const handleViewForm = (formId) => {
    navigate(`/inspection-form/${formId}`);
  };

  const handleCreateForm = () => {
    navigate('/inspection-form');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Inspection Forms</h1>
          
          {user.role === 'operator' && (
            <button
              onClick={handleCreateForm}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create New Form
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading forms...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            {error}
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">No inspection forms found.</p>
            {user.role === 'operator' && (
              <button
                onClick={handleCreateForm}
                className="mt-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-200"
              >
                Create your first form
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow-sm rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {(user.role === 'qa' || user.role === 'avp') ? 'Submitted By' : 'Reviewed By'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {form.documentNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(form.inspectionDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {form.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {form.variant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(form.status)}`}>
                        {form.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(user.role === 'qa' || user.role === 'avp') ? form.submittedBy : (form.reviewedBy || '-')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewForm(form.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {(user.role === 'qa' || user.role === 'avp') && form.status === 'SUBMITTED' ? 'Review' : 'View'}
                      </button>
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

export default InspectionFormList;
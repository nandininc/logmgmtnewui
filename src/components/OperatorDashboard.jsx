import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionFormAPI } from './api';
import { DashboardLayout, formatDate } from './SharedComponents';

const OperatorDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentForms, setRecentForms] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    documentNo: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    product: '100 mL Bag Pke.',
    sizeNo: '',
    shift: 'C',
    variant: 'Pink matt',
    lineNo: '02',
    customer: '',
    sampleSize: '08 Nos.',
    lacquers: [
      { id: 1, name: 'Clear Extn', weight: '', batchNo: '', expiryDate: '' },
      { id: 2, name: 'Red Dye', weight: '', batchNo: '', expiryDate: '' },
      { id: 3, name: 'Black Dye', weight: '', batchNo: '', expiryDate: '' },
      { id: 4, name: 'Pink Dye', weight: '', batchNo: '', expiryDate: '' },
      { id: 5, name: 'Violet Dye', weight: '', batchNo: '', expiryDate: '' },
      { id: 6, name: 'Matt Bath', weight: '', batchNo: '', expiryDate: '' },
      { id: 7, name: 'Hardener', weight: '', batchNo: '', expiryDate: '' },
      { id: 8, name: '', weight: '', batchNo: '', expiryDate: '' }
    ]
  });

  // Fetch recent forms on component mount
  useEffect(() => {
    const fetchRecentForms = async () => {
      try {
        const forms = await inspectionFormAPI.getFormsBySubmitter(user.name);
        setRecentForms(forms.slice(0, 5)); // Get the 5 most recent forms
      } catch (error) {
        console.error("Error fetching recent forms:", error);
      }
    };

    fetchRecentForms();
  }, [user.name]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle lacquer input changes
  const handleLacquerChange = (index, field, value) => {
    const updatedLacquers = [...formData.lacquers];
    updatedLacquers[index] = {
      ...updatedLacquers[index],
      [field]: value
    };

    setFormData({
      ...formData,
      lacquers: updatedLacquers
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the form data with additional fields needed for backend
      const newFormData = {
        ...formData,
        issuanceNo: "00",
        issueDate: new Date().toISOString().split('T')[0],
        reviewedDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
        page: "1 of 1",
        preparedBy: "QQM QC",
        approvedBy: "AVP-QA & SYS",
        issued: "AVP-QA & SYS",
        characteristics: [
          { id: 1, name: "Colour Shade", observation: "", comments: "" },
          { id: 2, name: "(Colour Height)", observation: "", comments: "" },
          { id: 3, name: "Any Visual defect", observation: "", comments: "" },
          { id: 4, name: "MEK Test", observation: "", comments: "" },
          { id: 5, name: "Cross Cut Test (Tape Test)", observation: "", comments: "" },
          { id: 6, name: "Coating Thickness", bodyThickness: "", bottomThickness: "", comments: "" },
          { id: 7, name: "Temperature", observation: "", comments: "" },
          { id: 8, name: "Viscosity", observation: "", comments: "" },
          { id: 9, name: "Batch Composition", observation: "", comments: "" }
        ],
        productionOperator: user.name,
        operatorSignature: `signed_by_${user.name.toLowerCase().replace(/\s/g, '_')}`,
        status: "DRAFT"
      };

      // Create a new form
      await inspectionFormAPI.createForm(newFormData);

      // Reset form and update UI
      alert("Inspection form created successfully!");
      setShowForm(false);

      // Refresh recent forms
      const forms = await inspectionFormAPI.getFormsBySubmitter(user.name);
      setRecentForms(forms.slice(0, 5));

    } catch (error) {
      console.error("Error creating form:", error);
      alert("Failed to create inspection form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to view all forms
  const handleViewAllForms = () => {
    navigate('/forms');
  };

  // Navigate to create a new form
  const handleCreateNewForm = () => {
    navigate('/inspection-form');
  };
  

  // Navigate to view a specific form
  const handleViewForm = (formId) => {
    navigate(`/inspection-form/${formId}`);
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      title="Operator Dashboard"
      subtitle="Manage production inspections and reports"
    >

      {/* Form Status Overview */}
      <div className="bg-white shadow sm:rounded-lg mb-4">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Form Status Overview</h3>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 truncate">Draft Forms</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {recentForms.filter(form => form.status === 'DRAFT').length}
              </dd>
            </div>
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 truncate">Submitted Forms</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {recentForms.filter(form => form.status === 'SUBMITTED').length}
              </dd>
            </div>
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 truncate">Approved Forms</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {recentForms.filter(form => form.status === 'APPROVED').length}
              </dd>
            </div>
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500 truncate">Rejected Forms</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {recentForms.filter(form => form.status === 'REJECTED').length}
              </dd>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={handleCreateNewForm}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Inspection Form
            </button>
            <button
              onClick={handleViewAllForms}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View All Inspection Forms
            </button>
          </div>
        </div>
      </div>

      {/* Recent Inspection Forms - Now Full Width */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Inspection Forms</h3>
            <button
              onClick={handleViewAllForms}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All 
            </button>
          </div>
          <div className="mt-4">
            {recentForms.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No recent inspection forms
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentForms.map(form => (
                  <li key={form.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{form.documentNo || 'No Document #'}</p>
                      <p className="text-sm text-gray-500">
                        {form.variant} - Line {form.lineNo} - {formatDate(form.inspectionDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: <span className={`font-medium ${form.status === 'APPROVED' ? 'text-green-600' :
                          form.status === 'REJECTED' ? 'text-red-600' :
                            form.status === 'SUBMITTED' ? 'text-blue-600' : 'text-gray-600'
                          }`}>{form.status}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewForm(form.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      
    </DashboardLayout>
  );
};

export default OperatorDashboard;
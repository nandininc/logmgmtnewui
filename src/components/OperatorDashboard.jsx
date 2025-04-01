import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionFormAPI } from './api';

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
  
  // Redirect to forms page on component mount
  useEffect(() => {
    navigate('/forms');
  }, [navigate]);
  
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
  const handleViewRecentReports = () => {
    navigate('/forms');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-300 shadow shadow fixed top: 0 w-full">
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
          <h1 className="text-2xl font-semibold text-gray-900">Operator Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage production inspections and reports</p>
        </div>
        
      </main>
    </div>
  );
};

export default OperatorDashboard;
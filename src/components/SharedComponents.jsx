import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { Avatar, Typography, Button } from '@mui/material';

// Navigation header component shared across all dashboards
export const TopNavBar = ({ user, onLogout }) => {
    // Set background color based on user role
    const getBgColorByRole = (role) => {
        switch (role) {
            case 'operator':
                return 'bg-green-300';
            case 'qa':
                return 'bg-purple-400';
            case 'avp':
                return 'bg-red-300';
            case 'master':
                return 'bg-blue-300';
            default:
                return 'bg-gray-300';
        }
    };

    // Get readable role name for display
    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'operator':
                return 'Production Operator';
            case 'qa':
                return 'Quality Assurance';
            case 'avp':
                return 'AVP - QA & Systems';
            case 'master':
                return 'Administrator';
            default:
                return role.charAt(0).toUpperCase() + role.slice(1);
        }
    };

    return (
        <header className={`shadow fixed top-0 w-full ${getBgColorByRole(user.role)}`}>
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">

                <div className="flex items-center">
                    {/* <div className="font-bold text-3xl relative">
                        <span className="text-purple-600">A</span>
                        <span className="text-fuchsia-500">G</span>
                        <span className="text-pink-500">I</span>
                        <div className="w-full h-1.5 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 rounded-full mt-1"></div>
                    </div>
                    <div className="bg-yellow-400 ml-3 px-2 py-0.5 rounded-sm transform -rotate-2">
                        <span className="text-sm font-extrabold uppercase tracking-wider text-gray-800">E-log</span>
                    </div> */}
                    <div className=" flex justify-center">
                        <img
                            src="https://camo.githubusercontent.com/23528efa2ac40a4438536df8a46ff30e8d90f42a342b6bf6dbb6decb55ab8e86/68747470733a2f2f656e637279707465642d74626e302e677374617469632e636f6d2f696d616765733f713d74626e3a414e64394763517336636a7049706377394a4c4d4b6b796d3366506a746d563163506b533535784e66512673"
                            alt="AGI Logo"
                            className="w-16 h-auto"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Avatar alt={user.name} src={user.avatarUrl || ''} />

                    <div className="flex flex-col mr-4">
                        <Typography variant="body2" className="font-medium">
                            {user.name}
                        </Typography>
                        <Typography variant="caption" className="text-gray-700">
                            {getRoleDisplayName(user.role)}
                        </Typography>
                    </div>

                    <Button
                        onClick={onLogout}
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<LogoutIcon />}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
};

// Dashboard Layout wrapper that includes shared elements
export const DashboardLayout = ({ user, onLogout, title, subtitle, children }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <TopNavBar user={user} onLogout={onLogout} />

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                    <p className="mt-2 text-gray-600">{subtitle}</p>
                </div>

                {children}
            </main>
        </div>
    );
};

// Reusable status badge component
export const StatusBadge = ({ status }) => {
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

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(status)}`}>
            {status}
        </span>
    );
};

// Format date helper
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

// Format timestamp helper for activity feed
export const formatTimestamp = (timestamp) => {
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
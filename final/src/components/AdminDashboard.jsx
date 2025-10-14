import React from 'react';
import AdminAccess from './AdminAccess';
import SolverRegistration from './SolverRegistration';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AdminAccess />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
          <p className="text-gray-600 mb-6">Register new solvers directly from here</p>
          <div className="relative">
            <SolverRegistration defaultOpen={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



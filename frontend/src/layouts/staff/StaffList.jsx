import React, { useState, useEffect } from 'react';
import { Users, UserPlus, FileText, Search, Plus } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';
import Button from '../../components/button/Button';
import Input from '../../components/input/Input';

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', department: '', contact: '' });
  
  // Basic mock check if the logged in user is admin (in real app, this comes from context/token JWT)
  const isAdmin = localStorage.getItem('token') === 'default-auth-token';

  const fetchStaff = async () => {
    try {
      const res = await axiosInstance.get('http://127.0.0.1:5010/api/staff/');
      setStaff(res.data.staff);
    } catch (err) {
      toast.error('Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('http://127.0.0.1:5010/api/staff/', newStaff);
      toast.success('Staff added successfully!');
      setShowAddModal(false);
      setNewStaff({ name: '', role: '', department: '', contact: '' });
      fetchStaff();
    } catch (err) {
      toast.error('Failed to add staff.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" /> Prison Staff Directory
          </h1>
          <p className="text-slate-600">View and manage authorized facility personnel.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Staff Member
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading staff directory...</div>
        ) : staff.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No staff members found. Add some starting staff.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role / Title</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">#{s.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {s.name.charAt(0)}
                    </div>
                    {s.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{s.role}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{s.department || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{s.contact || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {s.joined_date ? new Date(s.joined_date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" /> Add New Staff
            </h2>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <Input label="Full Name" required value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
              <Input label="Role / Title" required placeholder="e.g. Guard, Doctor, Warden" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} />
              <Input label="Department" value={newStaff.department} onChange={e => setNewStaff({...newStaff, department: e.target.value})} />
              <Input label="Contact Info" value={newStaff.contact} onChange={e => setNewStaff({...newStaff, contact: e.target.value})} />
              <div className="flex gap-4 pt-4 mt-6 border-t border-slate-100">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1">Create Staff</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

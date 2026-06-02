import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import { Search, Shield, Loader } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  last_login: string;
  total_jobs: number;
  is_active: boolean;
}

interface UserDrawerProps {
  user: AdminUser | null;
  onClose: () => void;
}

const UserDetailDrawer: React.FC<UserDrawerProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40"
      onClick={onClose}
    >
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-800 border-l border-slate-700/50 p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-h4 text-white">User Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Email</p>
            <p className="text-white">{user.email}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">Full Name</p>
            <p className="text-white">{user.full_name || '—'}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">Role</p>
            <p className="text-white font-mono">{user.role}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">Joined</p>
            <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">Last Login</p>
            <p className="text-white">
              {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">Total Inferences</p>
            <p className="text-white text-lg font-mono font-bold">{user.total_jobs}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-1">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded text-sm ${
                user.is_active
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}
            >
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/v1/admin/users');
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [search, roleFilter, users]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="container py-10 flex justify-center items-center min-h-[60vh]">
          <Loader className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 text-white mb-4">User Management</h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Jobs
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/20">
                    <td className="px-6 py-4 text-slate-300 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-white text-sm">{user.full_name || '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'superadmin'
                            ? 'bg-red-500/20 text-red-300'
                            : user.role === 'admin'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-500/20 text-slate-300'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                      {user.total_jobs}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No users found matching your filters
            </div>
          )}
        </div>

        {/* User Detail Drawer */}
        <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />

        {/* Summary */}
        <div className="mt-6 text-slate-400 text-sm">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </AdminLayout>
  );
}

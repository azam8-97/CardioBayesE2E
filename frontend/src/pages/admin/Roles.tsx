import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuthStore } from '../../stores/authStore';
import { Loader, Shield } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  current_role: string;
}

interface RoleChangeLog {
  id: string;
  created_at: string;
  changed_by: string;
  user: string;
  old_role: string;
  new_role: string;
  reason?: string;
}

interface RoleChangeModalProps {
  user: UserWithRole | null;
  onClose: () => void;
  onConfirm: (newRole: string, reason: string) => Promise<void>;
}

const RoleChangeModal: React.FC<RoleChangeModalProps> = ({ user, onClose, onConfirm }) => {
  const [newRole, setNewRole] = useState('user');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onConfirm(newRole, reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-h4 text-white mb-6">Change User Role</h2>

        <div className="mb-6 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
          <p className="text-slate-400 text-sm mb-1">Current User</p>
          <p className="text-white font-medium">{user.email}</p>
          <p className="text-slate-400 text-sm mt-2">Current Role</p>
          <p className="text-slate-300 font-mono">{user.current_role}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2">New Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 outline-none disabled:opacity-50"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              placeholder="e.g., Promotion to team lead..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 outline-none disabled:opacity-50"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Change Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminRoles() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [changelog, setChangelog] = useState<RoleChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);

  // Check if user is superadmin
  const isSuperadmin = currentUser?.role === 'superadmin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, logRes] = await Promise.all([
          apiClient.get('/api/v1/admin/roles/users'),
          apiClient.get('/api/v1/admin/roles/changelog'),
        ]);

        setUsers(usersRes.data.users);
        setFilteredUsers(usersRes.data.users);
        setChangelog(logRes.data.changelog);
      } catch (err) {
        console.error('Failed to load role data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isSuperadmin) {
      fetchData();
    }
  }, [isSuperadmin]);

  useEffect(() => {
    let filtered = users;

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  }, [search, users]);

  const handleRoleChange = async (newRole: string, reason: string) => {
    if (!selectedUser) return;

    try {
      await apiClient.patch(`/api/v1/admin/roles/change`, {
        user_id: selectedUser.id,
        new_role: newRole,
        reason,
      });

      // Refresh data
      const [usersRes, logRes] = await Promise.all([
        apiClient.get('/api/v1/admin/roles/users'),
        apiClient.get('/api/v1/admin/roles/changelog'),
      ]);

      setUsers(usersRes.data.users);
      setFilteredUsers(usersRes.data.users);
      setChangelog(logRes.data.changelog);
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  if (!isSuperadmin) {
    return (
      <AdminLayout>
        <div className="container py-10 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-h4 text-white mb-2">Access Denied</h2>
            <p className="text-slate-400">
              This page is only accessible to superadmins.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
          <h1 className="text-h2 text-white mb-2">Role Management</h1>
          <p className="text-slate-400">Manage user roles and view change history</p>
        </div>

        {/* Users Section */}
        <div className="mb-8">
          <h2 className="text-h4 text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Users & Roles
          </h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
            />
          </div>

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
                      Current Role
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/20">
                      <td className="px-6 py-4 text-white text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{user.full_name || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            user.current_role === 'superadmin'
                              ? 'bg-red-500/20 text-red-300'
                              : user.current_role === 'admin'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-slate-500/20 text-slate-300'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {user.current_role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No users found matching your search
              </div>
            )}
          </div>
        </div>

        {/* Change History */}
        <div>
          <h2 className="text-h4 text-white mb-4">Role Change Audit Trail</h2>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">User</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      Changed By
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      Old Role
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      New Role
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {changelog.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-700/20">
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-white text-sm">{log.user}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{log.changed_by}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-600 text-slate-200 rounded text-xs font-medium">
                          {log.old_role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            log.new_role === 'superadmin'
                              ? 'bg-red-500/20 text-red-300'
                              : log.new_role === 'admin'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-slate-500/20 text-slate-300'
                          }`}
                        >
                          {log.new_role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm max-w-xs truncate">
                        {log.reason || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {changelog.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No role changes recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Role Change Modal */}
        <RoleChangeModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onConfirm={handleRoleChange}
        />
      </div>
    </AdminLayout>
  );
}

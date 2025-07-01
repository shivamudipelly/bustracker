import { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Edit, Trash2, Users, Shield, Eye,
  MoreVertical, Mail, Phone, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { AddUserModal } from '../components/AddUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { apiService } from '@/services/api';
import { formatDateTime } from '@/utils/formatDateTime';
import { toast } from '@/components/ui/sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'driver' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiService.getUsers();
        if (res.success && res.data) setUsers(res.data);
        else toast.error(res.message || "Failed to fetch users");
      } catch (err) {
        toast.error("API error fetching users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const confirmDelete = async () => {
    if (!deleteUserId) return;
    try {
      const res = await apiService.deleteUser(deleteUserId);
      if (res.success) {
        toast.success("User deleted successfully!");
        setUsers(prev => prev.filter(u => u.id !== deleteUserId));
      } else {
        toast.error(res.message || "Failed to delete user.");
      }
    } catch (err) {
      toast.error("An error occurred.");
      console.error(err);
    } finally {
      setDeleteUserId(null);
      setDeleteUserName('');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'driver': return 'bg-blue-500 text-white';
      case 'viewer': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'inactive': return 'bg-yellow-500 text-white';
      case 'suspended': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center text-gray-600 text-lg">Loading users...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-500">Manage system users and permissions</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>Users Overview</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge className={getRoleColor(user.role)}>{user.role}</Badge></TableCell>
                    <TableCell><Badge className={getStatusColor(user.status)}>{user.status}</Badge></TableCell>
                    <TableCell className="text-sm">{user.phone}</TableCell>
                    <TableCell className="text-sm">{formatDateTime(user.createdAt)}</TableCell>
                    <TableCell className="text-sm">{formatDateTime(user.lastLogin)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setDeleteUserId(user.id);
                          setDeleteUserName(user.name);
                        }}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onUserAdded={(newUser) => setUsers(prev => [...prev, newUser])}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={(updated) => setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))}
        />
      )}
      {deleteUserId && (
        <ConfirmDeleteModal
          userName={deleteUserName}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteUserId(null);
            setDeleteUserName('');
          }}
        />
      )}
    </div>
  );
};

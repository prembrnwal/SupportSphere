import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Trash2, UserPlus, Mail, User as UserIcon } from 'lucide-react';
import {
  Card,
  Input,
  Select,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Modal,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  TableRowSkeleton,
} from '@/components/ui';
import { useUsersList, useCreateUser, useUpdateUserRole, useDeleteUser } from '@/hooks/useUsers';
import { initials, formatDate } from '@/lib/utils';
import type { User, UserRole } from '@/types';

export function ManageUsersPage() {
  const { data: users, isLoading, isError, refetch } = useUsersList();
  const createUser = useCreateUser();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Add User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('customer');

  const filtered = users?.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    try {
      await updateRole.mutateAsync({ id, role: newRole });
      toast.success('User role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await createUser.mutateAsync({ name, email, role });
      toast.success(`User ${name} created successfully`);
      setName('');
      setEmail('');
      setRole('customer');
      setIsAddUserOpen(false);
    } catch {
      toast.error('Failed to create user');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser.mutateAsync(userToDelete.id);
      toast.success(`${userToDelete.name} removed`);
      setUserToDelete(null);
    } catch {
      toast.error('Failed to remove user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View, add, promote, or remove members of your organization.
          </p>
        </div>
        <Button onClick={() => setIsAddUserOpen(true)}>
          <UserPlus className="h-4 w-4" /> Add New User
        </Button>
      </div>

      <Card className="!p-4">
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </Card>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Joined</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyState title="No users found" description="Try a different search term or add a user." />
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold">
                        {initials(u.name)}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{u.name}</span>
                    </div>
                  </TD>
                  <TD className="text-slate-500 dark:text-slate-400">{u.email}</TD>
                  <TD>
                    <Select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="h-8 text-xs !w-32"
                      options={[
                        { value: 'customer', label: 'Customer' },
                        { value: 'admin', label: 'Admin' },
                      ]}
                    />
                  </TD>
                  <TD className="text-slate-400">{formatDate(u.createdAt)}</TD>
                  <TD className="text-right">
                    <button
                      onClick={() => setUserToDelete(u)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                      title="Remove User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      )}

      {/* Add User Modal */}
      <Modal open={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Add New User">
        <form onSubmit={handleAddUserSubmit} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            icon={<UserIcon className="h-4 w-4" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. rahul@company.com"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: 'customer', label: 'Customer (Ticket Requester)' },
              { value: 'admin', label: 'Admin (Full Operations Power)' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
            <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createUser.isPending}>
              <UserPlus className="h-4 w-4" /> Add User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title={`Remove ${userToDelete?.name}?`}
        description="This will permanently remove this user's access. This action cannot be undone."
        confirmLabel="Remove user"
        variant="danger"
        loading={deleteUser.isPending}
      />
    </div>
  );
}

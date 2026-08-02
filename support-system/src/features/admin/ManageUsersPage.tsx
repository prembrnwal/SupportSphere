import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Trash2, ShieldCheck } from 'lucide-react';
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
  Badge,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  TableRowSkeleton,
} from '@/components/ui';
import { useUsersList, useUpdateUserRole, useDeleteUser } from '@/hooks/useUsers';
import { initials, formatDate } from '@/lib/utils';
import type { User, UserRole } from '@/types';

const roleVariant: Record<UserRole, 'default' | 'warning'> = {
  admin: 'warning',
  customer: 'default',
};

export function ManageUsersPage() {
  const { data: users, isLoading, isError, refetch } = useUsersList();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [search, setSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const filtered = users?.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleRoleChange = async (id: string, role: UserRole) => {
    try {
      await updateRole.mutateAsync({ id, role });
      toast.success('User role updated');
    } catch {
      toast.error('Failed to update role');
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Users</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View, promote, or remove members of your support organization.
        </p>
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
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyState title="No users found" description="Try a different search term." />
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-semibold">
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
                        { value: 'agent', label: 'Agent' },
                        { value: 'admin', label: 'Admin' },
                      ]}
                    />
                  </TD>
                  <TD className="text-slate-400">{formatDate(u.createdAt)}</TD>
                  <TD>
                    <button
                      onClick={() => setUserToDelete(u)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
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

      <ConfirmDialog
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title={`Remove ${userToDelete?.name}?`}
        description="This will permanently remove this user's access. This action cannot be undone."
        confirmLabel="Remove user"
        loading={deleteUser.isPending}
      />
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dummyUsers } from '@/lib/dummyData';
import type { User, UserRole } from '@/types';

let userStore: User[] = [...dummyUsers];

function delay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export function useUsersList() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => delay([...userStore]),
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => delay(userStore.filter((u) => u.role === 'admin')),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; email: string; role: UserRole }) => {
      const newUser: User = {
        id: 'u' + (userStore.length + 1) + '-' + Date.now(),
        name: input.name,
        email: input.email,
        role: input.role,
        createdAt: new Date().toISOString(),
      };
      userStore = [newUser, ...userStore];
      return delay(newUser, 400);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => {
      userStore = userStore.map((u) => (u.id === id ? { ...u, role } : u));
      return delay(userStore.find((u) => u.id === id), 400);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      userStore = userStore.filter((u) => u.id !== id);
      return delay(true, 400);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

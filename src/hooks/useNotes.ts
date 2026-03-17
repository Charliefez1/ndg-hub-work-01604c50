import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

export type Note = Tables<'notes'>;

const KEY = ['notes'];

export function useNotes(projectId?: string) {
  return useQuery({
    queryKey: [...KEY, projectId],
    queryFn: async () => {
      let q = supabase.from('notes').select('*').order('updated_at', { ascending: false });
      if (projectId) q = q.eq('project_id', projectId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Note[];
    },
  });
}

export function useCreateNote() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: Omit<TablesInsert<'notes'>, 'user_id'>) => {
      const { data, error } = await supabase
        .from('notes')
        .insert({ ...note, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...u }: TablesUpdate<'notes'> & { id: string }) => {
      const { data, error } = await supabase.from('notes').update(u).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

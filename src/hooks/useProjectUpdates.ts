import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

export type ProjectUpdate = Tables<'project_updates'>;

const KEY = ['project_updates'];

export function useProjectUpdates(projectId?: string) {
  return useQuery({
    queryKey: [...KEY, projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProjectUpdate[];
    },
  });
}

export function useCreateProjectUpdate() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (update: Omit<TablesInsert<'project_updates'>, 'author_id'>) => {
      const { data, error } = await supabase
        .from('project_updates')
        .insert({ ...update, author_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

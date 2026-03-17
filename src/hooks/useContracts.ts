import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Contract = Tables<'contracts'>;

const KEY = ['contracts'];

export function useContracts(organisationId?: string) {
  return useQuery({
    queryKey: [...KEY, organisationId],
    queryFn: async () => {
      let q = supabase.from('contracts').select('*, organisations(name), projects(name)').order('created_at', { ascending: false });
      if (organisationId) q = q.eq('organisation_id', organisationId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: TablesInsert<'contracts'>) => {
      const { data, error } = await supabase.from('contracts').insert(c).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...u }: TablesUpdate<'contracts'> & { id: string }) => {
      const { data, error } = await supabase.from('contracts').update(u).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

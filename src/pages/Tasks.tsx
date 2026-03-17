import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Plus, CheckSquare, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { getStatusBadgeClasses } from '@/lib/status-colors';

const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done', 'blocked'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [view, setView] = useState<'table' | 'board'>('table');
  const [dialogOpen, setDialogOpen] = useState(false);

  const boardGroups = TASK_STATUSES.map((s) => ({
    status: s,
    items: tasks?.filter((t) => t.status === s) ?? [],
  }));

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateTask.mutateAsync({ id, status });
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <AppShell>
      <div className="space-y-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-page-title">Tasks</h1>
          <div className="flex items-center gap-sm">
            <Tabs value={view} onValueChange={(v) => setView(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="table" className="text-xs px-2">Table</TabsTrigger>
                <TabsTrigger value="board" className="text-xs px-2">Board</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> New Task</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-sm">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !tasks?.length ? (
          <div className="bg-surface rounded-lg border p-xl text-center space-y-md">
            <CheckSquare className="h-12 w-12 mx-auto text-text-3" strokeWidth={1.25} />
            <p className="text-body text-text-2">No tasks yet.</p>
            <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> New Task</Button>
          </div>
        ) : view === 'table' ? (
          <div className="rounded-lg border bg-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell>{(t as any).projects?.name ?? '—'}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{t.priority}</Badge></TableCell>
                    <TableCell>
                      <Select value={t.status} onValueChange={(v) => handleStatusChange(t.id, v)}>
                        <SelectTrigger className="h-7 w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>{TASK_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{t.due_date ?? '—'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={async () => { await deleteTask.mutateAsync(t.id); toast.success('Task deleted'); }} className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex gap-md overflow-x-auto pb-md">
            {boardGroups.map((g) => (
              <div key={g.status} className="min-w-[220px] w-[220px] shrink-0">
                <div className="flex items-center gap-2 mb-sm">
                  <Badge variant="outline" className="capitalize text-xs">{g.status.replace('_', ' ')}</Badge>
                  <span className="text-caption text-text-3">{g.items.length}</span>
                </div>
                <div className="space-y-xs">
                  {g.items.map((t) => (
                    <div key={t.id} className="bg-surface rounded-md border p-sm">
                      <p className="text-body font-medium truncate">{t.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="capitalize text-xs">{t.priority}</Badge>
                        <span className="text-caption text-text-3">{t.due_date ?? ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTaskDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppShell>
  );
}

function CreateTaskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const createTask = useCreateTask();
  const { data: projects } = useProjects();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask.mutateAsync({ title, description: description || null, project_id: projectId || null, priority, due_date: dueDate || null });
      toast.success('Task created');
      onOpenChange(false);
      setTitle(''); setDescription(''); setProjectId(''); setPriority('medium'); setDueDate('');
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-md">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-md">
            <div><Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>{projects?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          <div className="flex justify-end gap-sm">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createTask.isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

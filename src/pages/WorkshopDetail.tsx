import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDelivery, useSessions, useCreateSession, useDeleteSession, useAgendaItems, useCreateAgendaItem, useDeleteAgendaItem, type Session } from '@/hooks/useDeliveries';
import { ArrowLeft, Plus, Trash2, GripVertical, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { getStatusBadgeClasses } from '@/lib/status-colors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AGENDA_TYPES = ['activity', 'discussion', 'break', 'introduction', 'reflection', 'assessment'];

export default function WorkshopDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: delivery, isLoading } = useDelivery(id);
  const { data: sessions } = useSessions(id);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  if (isLoading) return <AppShell><Skeleton className="h-8 w-64" /></AppShell>;
  if (!delivery) return <AppShell><p className="text-text-2">Workshop not found.</p></AppShell>;

  return (
    <AppShell>
      <div className="space-y-lg">
        <div className="flex items-center gap-md">
          <Link to="/workshops" className="text-text-3 hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-page-title">{delivery.title}</h1>
          <Badge className={getStatusBadgeClasses(delivery.status, 'delivery')}>{delivery.status.replace('_', ' ')}</Badge>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions ({sessions?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-md">
            <Card>
              <CardContent className="pt-6 grid grid-cols-2 gap-md text-body">
                <div><span className="text-text-3 text-caption">Client</span><p>{(delivery as any).organisations?.name ?? '—'}</p></div>
                <div><span className="text-text-3 text-caption">Project</span><p><Link to={`/projects/${delivery.project_id}`} className="text-primary hover:underline">{(delivery as any).projects?.name}</Link></p></div>
                <div><span className="text-text-3 text-caption">Service</span><p>{(delivery as any).services?.name ?? '—'}</p></div>
                <div><span className="text-text-3 text-caption">Date</span><p>{delivery.delivery_date ?? '—'}</p></div>
                <div><span className="text-text-3 text-caption">Duration</span><p>{delivery.duration_minutes ? `${delivery.duration_minutes}m` : '—'}</p></div>
                <div><span className="text-text-3 text-caption">Delegates</span><p>{delivery.delegate_count ?? '—'}</p></div>
                <div><span className="text-text-3 text-caption">Location</span><p>{delivery.location ?? '—'}</p></div>
                <div><span className="text-text-3 text-caption">Neuro Phase</span><p>{delivery.neuro_phase ?? '—'}</p></div>
                <div className="col-span-2"><span className="text-text-3 text-caption">Notes</span><p className="whitespace-pre-wrap">{delivery.notes ?? '—'}</p></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="mt-md space-y-md">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setSessionDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Session</Button>
            </div>
            {!sessions?.length ? (
              <p className="text-text-2 text-center py-lg">No sessions yet.</p>
            ) : (
              <div className="space-y-xs">
                {sessions.map((s) => (
                  <div key={s.id} className="bg-surface rounded-md border p-md cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedSession(s.id === selectedSession ? null : s.id)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{s.title}</p>
                        <p className="text-caption text-text-3">{s.session_type} · {s.duration_minutes}m</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{s.content_status ?? 'draft'}</Badge>
                    </div>
                    {selectedSession === s.id && (
                      <div className="mt-md border-t pt-md">
                        <AgendaBuilder sessionId={s.id} projectId={delivery.project_id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {['feedback', 'documents'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-md">
              <p className="text-text-2 text-center py-lg capitalize">{tab} — coming soon.</p>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <AddSessionDialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen} deliveryId={id!} projectId={delivery.project_id} />
    </AppShell>
  );
}

function AgendaBuilder({ sessionId, projectId }: { sessionId: string; projectId: string }) {
  const { data: items } = useAgendaItems(sessionId);
  const createItem = useCreateAgendaItem();
  const deleteItem = useDeleteAgendaItem();
  const [addOpen, setAddOpen] = useState(false);
  const totalMinutes = items?.reduce((sum, i) => sum + i.duration_minutes, 0) ?? 0;

  return (
    <div className="space-y-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-caption text-text-3">
          <Clock className="h-3.5 w-3.5" /> Total: {totalMinutes}m
        </div>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Add Item</Button>
      </div>
      {items?.map((item, idx) => (
        <div key={item.id} className="flex items-center gap-2 bg-background rounded border p-sm">
          <GripVertical className="h-4 w-4 text-text-3 shrink-0" />
          <Badge variant="outline" className="text-xs capitalize shrink-0">{item.type}</Badge>
          <span className="text-body flex-1 truncate">{item.title}</span>
          <span className="text-caption text-text-3 shrink-0">{item.duration_minutes}m</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { deleteItem.mutate(item.id); }}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ))}
      {addOpen && <AddAgendaItemInline sessionId={sessionId} position={(items?.length ?? 0) + 1} onDone={() => setAddOpen(false)} />}
    </div>
  );
}

function AddAgendaItemInline({ sessionId, position, onDone }: { sessionId: string; position: number; onDone: () => void }) {
  const createItem = useCreateAgendaItem();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('activity');
  const [duration, setDuration] = useState('15');

  const submit = async () => {
    if (!title) return;
    await createItem.mutateAsync({ session_id: sessionId, title, type, duration_minutes: Number(duration), position });
    onDone();
  };

  return (
    <div className="flex items-center gap-2 bg-background rounded border p-sm">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
        <SelectContent>{AGENDA_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
      </Select>
      <Input className="h-8 flex-1" placeholder="Item title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input className="h-8 w-16" type="number" placeholder="mins" value={duration} onChange={(e) => setDuration(e.target.value)} />
      <Button size="sm" className="h-8" onClick={submit} disabled={createItem.isPending}>Add</Button>
      <Button size="sm" variant="ghost" className="h-8" onClick={onDone}>✕</Button>
    </div>
  );
}

function AddSessionDialog({ open, onOpenChange, deliveryId, projectId }: { open: boolean; onOpenChange: (o: boolean) => void; deliveryId: string; projectId: string }) {
  const createSession = useCreateSession();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('90');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSession.mutateAsync({ title, delivery_id: deliveryId, project_id: projectId, duration_minutes: Number(duration) });
      toast.success('Session added');
      onOpenChange(false);
      setTitle(''); setDuration('90');
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Session</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-md">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div><Label>Duration (mins)</Label><Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
          <div className="flex justify-end gap-sm">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createSession.isPending}>Add</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

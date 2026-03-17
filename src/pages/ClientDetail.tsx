import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOrganisation, useUpdateOrganisation, useContacts, useCreateContact, useDeleteContact } from '@/hooks/useOrganisations';
import { ArrowLeft, Plus, Star, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: org, isLoading } = useOrganisation(id);
  const updateOrg = useUpdateOrganisation();
  const { data: contacts } = useContacts(id);
  const createContact = useCreateContact();
  const deleteContact = useDeleteContact();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  if (isLoading) return <AppShell><Skeleton className="h-8 w-48" /></AppShell>;
  if (!org) return <AppShell><p className="text-text-2">Client not found.</p></AppShell>;

  return (
    <AppShell>
      <div className="space-y-lg">
        <div className="flex items-center gap-md">
          <Link to="/clients" className="text-text-3 hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-page-title">{org.name}</h1>
          <Badge variant={org.status === 'active' ? 'default' : 'secondary'} className="capitalize">{org.status}</Badge>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="contacts">Contacts ({contacts?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-md">
            <Card>
              <CardContent className="pt-6 grid grid-cols-2 gap-md text-body">
                <div><span className="text-text-3 text-caption">Sector</span><p>{org.sector ?? '—'}</p></div>
                <div><span className="text-text-3 text-caption">Email</span><p>{org.email ?? '—'}</p></div>
                <div><span className="text-text-3 text-caption">Phone</span><p>{org.phone ?? '—'}</p></div>
                <div><span className="text-text-3 text-caption">Website</span><p>{org.website ?? '—'}</p></div>
                <div className="col-span-2"><span className="text-text-3 text-caption">Address</span><p>{org.address ?? '—'}</p></div>
                <div className="col-span-2"><span className="text-text-3 text-caption">Notes</span><p className="whitespace-pre-wrap">{org.notes ?? '—'}</p></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-md space-y-md">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setContactDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Contact</Button>
            </div>
            {!contacts?.length ? (
              <p className="text-text-2 text-center py-lg">No contacts yet.</p>
            ) : (
              <div className="rounded-lg border bg-surface overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {c.name}
                          {c.is_primary && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                        </TableCell>
                        <TableCell>{c.job_title ?? '—'}</TableCell>
                        <TableCell>{c.email ?? '—'}</TableCell>
                        <TableCell>{c.phone ?? '—'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await deleteContact.mutateAsync(c.id); toast.success('Contact deleted'); }}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} organisationId={id!} onCreate={createContact} />
    </AppShell>
  );
}

function AddContactDialog({ open, onOpenChange, organisationId, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; organisationId: string; onCreate: ReturnType<typeof useCreateContact> }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreate.mutateAsync({ organisation_id: organisationId, name, email: email || null, phone: phone || null, job_title: jobTitle || null, is_primary: isPrimary });
      toast.success('Contact added');
      onOpenChange(false);
      setName(''); setEmail(''); setPhone(''); setJobTitle(''); setIsPrimary(false);
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-md">
          <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-md">
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div><Label>Job Title</Label><Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></div>
          <label className="flex items-center gap-2 text-body cursor-pointer">
            <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
            Primary contact
          </label>
          <div className="flex justify-end gap-sm">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={onCreate.isPending}>Add</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

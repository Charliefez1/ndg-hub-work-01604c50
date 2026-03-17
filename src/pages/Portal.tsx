import { useAuth } from '@/hooks/useAuth';

export default function Portal() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background p-lg">
      <div className="max-w-4xl mx-auto space-y-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-page-title">Client Portal</h1>
          <button onClick={signOut} className="text-sm text-text-2 hover:text-foreground transition-colors">
            Sign Out
          </button>
        </div>
        <div className="bg-surface rounded-lg border p-lg text-center text-text-2">
          <p>Welcome{profile?.display_name ? `, ${profile.display_name}` : ''}! Your portal will be built in Step 1.15.</p>
        </div>
      </div>
    </div>
  );
}

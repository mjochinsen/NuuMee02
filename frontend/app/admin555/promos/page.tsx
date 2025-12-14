'use client';

import { useState, useEffect } from 'react';
import { getPromos, createPromo, deletePromo, PromoCode } from '@/lib/admin-api';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, AlertCircle, RefreshCw, Plus, Trash2 } from 'lucide-react';

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function PromosContent() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const loadPromos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPromos();
      setPromos(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load promo codes';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !credits) {
      toast.error('Code and credits are required');
      return;
    }

    setCreating(true);
    try {
      await createPromo({
        code: code.toUpperCase().trim(),
        credits: parseInt(credits, 10),
        max_uses: maxUses ? parseInt(maxUses, 10) : null,
        expires_at: expiresAt || null,
      });

      toast.success('Promo code created');

      // Reset form
      setCode('');
      setCredits('');
      setMaxUses('');
      setExpiresAt('');

      await loadPromos();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create promo code';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deletePromo(id);
      toast.success('Promo code deleted');
      await loadPromos();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete promo code';
      toast.error(message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Promo Codes</h1>
        <p className="text-[#94A3B8]">Create and manage promotional codes</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPromos}
            className="border-red-500/50 text-red-400 hover:bg-red-900/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Create Form */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Create New Promo Code</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-sm text-[#94A3B8] mb-2 block">
              Code <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER2025"
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B] uppercase"
              disabled={creating}
            />
          </div>

          <div>
            <label className="text-sm text-[#94A3B8] mb-2 block">
              Credits <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="100"
              min="1"
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
              disabled={creating}
            />
          </div>

          <div>
            <label className="text-sm text-[#94A3B8] mb-2 block">
              Max Uses <span className="text-[#64748B]">(optional)</span>
            </label>
            <Input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Unlimited"
              min="1"
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
              disabled={creating}
            />
          </div>

          <div>
            <label className="text-sm text-[#94A3B8] mb-2 block">
              Expires At <span className="text-[#64748B]">(optional)</span>
            </label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
              disabled={creating}
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              disabled={creating || !code || !credits}
              className="w-full bg-[#00F0D9] text-[#0F172A] hover:bg-[#00D9C5] disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create
            </Button>
          </div>
        </form>
      </div>

      {/* Promo Codes Table */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#334155]">
          <h2 className="text-lg font-semibold text-[#F1F5F9]">
            Existing Promo Codes ({promos.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-[#00F0D9] animate-spin" />
          </div>
        ) : promos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748B]">
            <p className="text-lg">No promo codes found</p>
            <p className="text-sm mt-2">Create one above to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E293B] border-b border-[#334155]">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Code</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Credits</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Usage</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Expires</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Created</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-[#F1F5F9] font-mono font-medium">
                      {promo.code}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#F1F5F9] text-right font-mono">
                      {promo.credits}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#94A3B8]">
                      {promo.current_uses} / {promo.max_uses ?? 'Unlimited'}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#94A3B8]">
                      {formatDate(promo.expires_at)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium border ${
                          promo.active
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}
                      >
                        {promo.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#94A3B8]">
                      {formatDate(promo.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      {deleteId === promo.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleDelete(promo.id)}
                            disabled={deleting}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            className="border-[#334155] text-[#F1F5F9]"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(promo.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default function PromosPage() {
  return (
    <AdminErrorBoundary fallbackTitle="Failed to load promo codes">
      <PromosContent />
    </AdminErrorBoundary>
  );
}

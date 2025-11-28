'use client';

import { useState } from 'react';
import { Key, Copy, Trash2, Plus, Eye, EyeOff, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'inactive';
}

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    { id: '1', name: 'Production Key', key: 'nuu_live_abc123xyz789def456ghi', created: 'Nov 1, 2025', lastUsed: 'Nov 14, 2025', status: 'active' },
    { id: '2', name: 'Development Key', key: 'nuu_test_xyz789abc123def456ghi', created: 'Oct 15, 2025', lastUsed: 'Nov 10, 2025', status: 'active' },
  ]);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleKeyVisibility = (id: string) => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));

  const copyToClipboard = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteKey = (id: string) => setApiKeys(prev => prev.filter(k => k.id !== id));

  const createNewKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: APIKey = { id: Date.now().toString(), name: newKeyName, key: `nuu_live_${Math.random().toString(36).substring(2, 24)}`, created: 'Just now', lastUsed: 'Never', status: 'active' };
    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setShowCreateForm(false);
  };

  const maskKey = (key: string) => `${key.substring(0, 12)}${'•'.repeat(20)}`;

  return (
    <main className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center"><Key className="w-6 h-6 text-[#00F0D9]" /></div>
            <div><h1 className="text-3xl font-bold text-[#F1F5F9]">API Keys</h1><p className="text-[#94A3B8] text-sm">Manage your API keys for programmatic access</p></div>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"><Plus className="w-4 h-4 mr-2" />Create New Key</Button>
        </div>
        <div className="h-px bg-[#334155] mt-4"></div>
      </div>

      {/* Create New Key Form */}
      {showCreateForm && (
        <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] mb-8">
          <h2 className="text-[#F1F5F9] mb-4">Create New API Key</h2>
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="keyName" className="text-[#94A3B8]">Key Name</Label><Input id="keyName" placeholder="e.g., Production Key" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8]" /></div>
            <div className="flex gap-3"><Button onClick={createNewKey} className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">Create Key</Button><Button onClick={() => setShowCreateForm(false)} variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">Cancel</Button></div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] mb-8">
        <div className="flex items-center justify-between mb-4"><h2 className="text-[#F1F5F9]">Your API Keys</h2><span className="text-[#94A3B8] text-sm">{apiKeys.length} key{apiKeys.length !== 1 ? 's' : ''}</span></div>
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-[#94A3B8]">No API keys yet. Create one to get started.</div>
          ) : (
            apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-[#334155] rounded-xl p-4 bg-[#1E293B] hover:border-[#00F0D9]/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div><h3 className="text-[#F1F5F9] font-semibold">{apiKey.name}</h3><div className="flex items-center gap-4 mt-1 text-sm text-[#94A3B8]"><span>Created: {apiKey.created}</span><span>Last used: {apiKey.lastUsed}</span></div></div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{apiKey.status}</Badge>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 px-3 py-2 bg-[#0F172A] rounded border border-[#334155] text-[#F1F5F9] font-mono text-sm">{showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}</code>
                  <Button onClick={() => toggleKeyVisibility(apiKey.id)} variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">{showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(apiKey.id, apiKey.key)} variant="outline" size="sm" className="border-[#334155] text-[#00F0D9] hover:bg-[#00F0D9]/10">{copiedId === apiKey.id ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy</>}</Button>
                  <Button onClick={() => deleteKey(apiKey.id)} variant="outline" size="sm" className="border-[#334155] text-red-400 hover:bg-red-400/10"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Warning */}
      <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6">
        <div className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div><h3 className="text-[#F1F5F9] font-semibold mb-2">Security Best Practices</h3>
            <ul className="space-y-1 text-[#94A3B8] text-sm">
              <li>• Never share your API keys publicly or commit them to version control</li>
              <li>• Use environment variables to store API keys in your applications</li>
              <li>• Rotate your keys regularly for enhanced security</li>
              <li>• Delete unused keys immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { Key, Copy, Eye, EyeOff, Trash2, Plus, BookOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  isLive: boolean;
}

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production Key',
      key: 'sk_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz5678',
      created: 'Oct 15, 2025',
      lastUsed: '2 hours ago',
      isLive: true,
    },
    {
      id: '2',
      name: 'Test Key',
      key: 'sk_test_xyz789uvw012abc345def678ghi901jkl234mno567pqr890stu123',
      created: 'Oct 15, 2025',
      lastUsed: 'Yesterday',
      isLive: false,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState('');
  const [keyToDelete, setKeyToDelete] = useState<APIKey | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set());

  const generateAPIKey = (isLive: boolean) => {
    const prefix = isLive ? 'sk_live_' : 'sk_test_';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = prefix;
    for (let i = 0; i < 48; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
  };

  const handleCreateKey = () => {
    const keyName = newKeyName.trim() || `API Key ${apiKeys.length + 1}`;
    const newKey = generateAPIKey(true);

    const apiKey: APIKey = {
      id: Date.now().toString(),
      name: keyName,
      key: newKey,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: 'Never',
      isLive: true,
    };

    setApiKeys([...apiKeys, apiKey]);
    setNewlyCreatedKey(newKey);
    setShowCreateModal(false);
    setShowNewKeyModal(true);
    setNewKeyName('');
  };

  const handleCopyKey = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeys(prev => new Set(prev).add(keyId));
    toast.success('Key copied to clipboard');

    setTimeout(() => {
      setCopiedKeys(prev => {
        const next = new Set(prev);
        next.delete(keyId);
        return next;
      });
    }, 2000);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const handleDeleteKey = () => {
    if (keyToDelete) {
      setApiKeys(apiKeys.filter(k => k.id !== keyToDelete.id));
      toast.success('API key deleted');
      setShowDeleteModal(false);
      setKeyToDelete(null);
    }
  };

  const truncateKey = (key: string) => {
    if (key.length <= 20) return key;
    return `${key.slice(0, 16)}...${key.slice(-6)}`;
  };

  const renderEmptyState = () => {
    return (
      <div className="border border-[#334155] rounded-2xl p-16 bg-[#0F172A] text-center">
        <div className="text-6xl mb-4">🔑</div>
        <h3 className="text-[#F1F5F9] mb-2">No API keys yet</h3>
        <p className="text-[#94A3B8] mb-6">
          Create an API key to get started
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create API Key
          </Button>
          <Button
            variant="outline"
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            onClick={() => window.open('/documentation', '_blank')}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View API Docs
          </Button>
        </div>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Key className="w-6 h-6 text-[#00F0D9]" />
          <h1 className="text-[#F1F5F9]">API Keys</h1>
        </div>
        <Button
          variant="outline"
          className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
          onClick={() => window.open('/documentation', '_blank')}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          View Docs
        </Button>
      </div>

      <div className="h-px bg-[#334155] mb-8"></div>

      {/* Description */}
      <p className="text-[#94A3B8] mb-6">
        Use API keys to access NuuMee.AI programmatically
      </p>

      {/* Create Button */}
      {apiKeys.length > 0 && (
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white mb-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New API Key
        </Button>
      )}

      {/* API Keys List */}
      {apiKeys.length > 0 ? (
        <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
          <h2 className="text-[#F1F5F9] mb-6">Your API Keys</h2>
          <div className="h-px bg-[#334155] mb-6"></div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => {
              const isVisible = visibleKeys.has(apiKey.id);
              const isCopied = copiedKeys.has(apiKey.id);

              return (
                <div
                  key={apiKey.id}
                  className="border border-[#334155] rounded-xl p-6 bg-[#1E293B] hover:border-[#00F0D9]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-[#F1F5F9]">{apiKey.name}</h3>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <code className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-[#00F0D9] font-mono text-sm">
                      {isVisible ? apiKey.key : truncateKey(apiKey.key)}
                    </code>
                    <Button
                      onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                      variant="outline"
                      size="sm"
                      className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      variant="outline"
                      size="sm"
                      className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    >
                      {isVisible ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[#94A3B8] text-sm space-y-1">
                      <div>Created: {apiKey.created}</div>
                      <div>Last used: {apiKey.lastUsed}</div>
                    </div>

                    <Button
                      onClick={() => {
                        setKeyToDelete(apiKey);
                        setShowDeleteModal(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-[#334155] text-[#F1F5F9] hover:border-red-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        renderEmptyState()
      )}

      {/* Security Warning */}
      {apiKeys.length > 0 && (
        <div className="mt-6 border border-amber-500/20 bg-amber-500/5 rounded-lg p-4">
          <p className="text-amber-500 text-sm flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>Keep your API keys secure - never share them publicly</span>
          </p>
        </div>
      )}

      {/* Create API Key Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9]">Create API Key</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name" className="text-[#94A3B8]">
                Key Name
              </Label>
              <Input
                id="key-name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder={`API Key ${apiKeys.length + 1}`}
                className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setNewKeyName('');
              }}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateKey}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              Create Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Key Created Modal */}
      <Dialog open={showNewKeyModal} onOpenChange={setShowNewKeyModal}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9] flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              API Key Created
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-4">
              <p className="text-amber-500 text-sm flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>Save this key - you won't see it again!</span>
              </p>
            </div>

            <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
              <code className="text-[#00F0D9] font-mono text-sm break-all">
                {newlyCreatedKey}
              </code>
            </div>

            <Button
              onClick={() => handleCopyKey(newlyCreatedKey, 'new')}
              className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowNewKeyModal(false);
                setNewlyCreatedKey('');
              }}
              variant="outline"
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9]">Delete API Key?</DialogTitle>
          </DialogHeader>

          {keyToDelete && (
            <div className="space-y-4">
              <div>
                <p className="text-[#F1F5F9] mb-1">{keyToDelete.name}</p>
                <code className="text-[#94A3B8] font-mono text-sm">
                  {truncateKey(keyToDelete.key)}
                </code>
              </div>

              <p className="text-[#94A3B8]">
                This will immediately stop all requests using this key.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setKeyToDelete(null);
              }}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteKey}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

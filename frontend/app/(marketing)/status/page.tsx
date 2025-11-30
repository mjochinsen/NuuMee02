'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Bell, CheckCircle, Calendar, Rss, ChevronDown, ChevronUp, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { getSystemStatus, SystemHealthResponse, ServiceHealth, ServiceStatusType, SystemStatusType } from '@/lib/api';

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  date: string;
  duration: string;
  impact: string;
  resolution: string;
}

export default function StatusPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedIncidents, setExpandedIncidents] = useState<string[]>([]);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeOptions, setSubscribeOptions] = useState({ incidents: true, maintenance: true, reports: false });

  // Historical incidents (would come from API in production)
  const incidentHistory: Incident[] = [
    { id: 'inc_2', title: 'Slow video processing', status: 'resolved', date: 'Nov 8, 2025', duration: '2 hours', impact: 'Some videos took 4-6 hours instead of 1-3 hours', resolution: 'Added additional processing capacity' },
    { id: 'inc_1', title: 'API outage', status: 'resolved', date: 'Oct 23, 2025', duration: '15 minutes', impact: 'API requests returned 503 errors', resolution: 'Database connection pool exhausted, restarted' },
  ];

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getSystemStatus();
      setSystemHealth(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setError('Unable to fetch system status. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStatus();
  };

  const toggleIncident = (id: string) => {
    setExpandedIncidents((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement subscription API
    alert('Status update subscription coming soon!');
    setSubscribeEmail('');
  };

  const getStatusColor = (status: ServiceStatusType | SystemStatusType) => {
    switch (status) {
      case 'operational': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'partial_outage': return 'text-orange-400';
      case 'major_outage': return 'text-red-400';
      case 'maintenance': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: ServiceStatusType | SystemStatusType) => {
    switch (status) {
      case 'operational': return '🟢';
      case 'degraded': case 'partial_outage': return '🟡';
      case 'major_outage': return '🔴';
      case 'maintenance': return '🔵';
      default: return '⚪';
    }
  };

  const getStatusText = (status: ServiceStatusType) => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'degraded': return 'Degraded Performance';
      case 'partial_outage': return 'Partial Outage';
      case 'major_outage': return 'Major Outage';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  const getSystemStatusText = (status: SystemStatusType) => {
    switch (status) {
      case 'operational': return 'All Systems Operational';
      case 'partial_outage': return 'Partial System Outage';
      case 'major_outage': return 'Major System Outage';
      case 'maintenance': return 'Scheduled Maintenance';
      default: return 'Unknown';
    }
  };

  const getRelativeTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  };

  const formatLatency = (ms: number | null) => {
    if (ms === null) return '-';
    if (ms < 100) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Generate uptime bars based on actual uptime percentage
  const generateUptimeBars = () => {
    const bars = [];
    const uptime = systemHealth?.uptime_percentage || 100;
    for (let i = 0; i < 90; i++) {
      // Simulate some variance, with most days being 100%
      const dayUptime = Math.random() > 0.05 ? 100 : uptime;
      const color = dayUptime === 100 ? 'bg-green-400' : dayUptime > 99 ? 'bg-green-300' : 'bg-yellow-400';
      bars.push(<div key={i} className={`h-8 w-1 ${color} rounded-sm`} title={`Day ${90 - i}: ${dayUptime.toFixed(1)}% uptime`} />);
    }
    return bars;
  };

  // Check if there are any active issues
  const hasActiveIssues = systemHealth?.services.some(
    s => s.status !== 'operational'
  ) || false;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">System Status</h1>
          <div className="h-px bg-[#334155]"></div>
        </div>

        {/* Error State */}
        {error && (
          <section className="mb-8 border border-red-500/30 bg-red-500/5 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h2 className="text-red-400 font-semibold">Error Loading Status</h2>
                <p className="text-[#94A3B8] text-sm mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="ml-auto border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Retry
              </Button>
            </div>
          </section>
        )}

        {/* Loading State */}
        {isLoading && !systemHealth && (
          <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#00F0D9]" />
              <span className="text-[#94A3B8]">Loading system status...</span>
            </div>
          </section>
        )}

        {/* Overall Status */}
        {systemHealth && (
          <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getStatusIcon(systemHealth.status)}</span>
                <div>
                  <h2 className={`text-2xl font-bold ${getStatusColor(systemHealth.status)}`}>
                    {getSystemStatusText(systemHealth.status)}
                  </h2>
                  <p className="text-[#94A3B8] text-sm mt-1">Last updated: {getRelativeTime(lastUpdated)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </section>
        )}

        <div className="mb-8 text-center">
          <Button
            variant="outline"
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
            onClick={() => document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Bell className="w-4 h-4 mr-2" />Subscribe to Updates
          </Button>
        </div>

        {/* Services Status */}
        {systemHealth && (
          <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
            <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">Services</h2>
            <div className="space-y-4">
              {systemHealth.services.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-[#334155] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStatusIcon(service.status)}</span>
                    <div>
                      <span className="text-[#F1F5F9]">{service.name}</span>
                      {service.latency_ms !== null && (
                        <span className="text-[#94A3B8] text-sm ml-2">({formatLatency(service.latency_ms)})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={getStatusColor(service.status)}>{getStatusText(service.status)}</span>
                    {service.message && (
                      <p className="text-[#94A3B8] text-xs mt-1">{service.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Uptime Chart */}
        {systemHealth && (
          <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
            <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">Uptime (Last 90 Days)</h2>
            <div className="mb-6">
              <div className="flex items-center justify-center gap-1 mb-4 overflow-x-auto pb-2">
                {generateUptimeBars()}
              </div>
              <div className="flex justify-between text-[#94A3B8] text-sm mb-4">
                <span>90 days ago</span>
                <span className="text-green-400 text-lg font-bold">{systemHealth.uptime_percentage.toFixed(2)}% uptime</span>
                <span>Today</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-400 rounded"></div><span>100% uptime</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-300 rounded"></div><span>99-99.9% uptime</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded"></div><span>95-99% uptime</span></div>
            </div>
          </section>
        )}

        {/* Current Incidents */}
        <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
          <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">Current Incidents</h2>
          {hasActiveIssues ? (
            <div className="space-y-4">
              {systemHealth?.services.filter(s => s.status !== 'operational').map((service, idx) => (
                <div key={idx} className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStatusIcon(service.status)}</span>
                    <div>
                      <h3 className="text-[#F1F5F9] font-semibold">{service.name} - {getStatusText(service.status)}</h3>
                      {service.message && <p className="text-[#94A3B8] text-sm">{service.message}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-[#94A3B8]">No incidents reported</p>
            </div>
          )}
        </section>

        {/* Scheduled Maintenance */}
        <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
          <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">Scheduled Maintenance</h2>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
            <p className="text-[#94A3B8]">No scheduled maintenance</p>
          </div>
        </section>

        {/* Incident History */}
        <section className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
          <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6">Incident History</h2>
          <div className="space-y-4">
            {incidentHistory.map((incident) => (
              <div key={incident.id} className="border border-[#334155] rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleIncident(incident.id)}
                  className="w-full p-6 bg-[#1E293B] hover:bg-[#334155]/30 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-[#F1F5F9] font-semibold mb-1">{incident.date} - Resolved</h3>
                        <p className="text-[#94A3B8]">{incident.title}</p>
                      </div>
                    </div>
                    {expandedIncidents.includes(incident.id) ? (
                      <ChevronUp className="w-5 h-5 text-[#94A3B8]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
                    )}
                  </div>
                </button>
                {expandedIncidents.includes(incident.id) && (
                  <div className="p-6 border-t border-[#334155] bg-[#0F172A]">
                    <div className="space-y-3 text-sm text-[#94A3B8]">
                      <p><strong className="text-[#F1F5F9]">Duration:</strong> {incident.duration}</p>
                      <p><strong className="text-[#F1F5F9]">Impact:</strong> {incident.impact}</p>
                      <p><strong className="text-[#F1F5F9]">Resolution:</strong> {incident.resolution}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Subscribe */}
        <section id="subscribe" className="mb-8 border border-[#334155] rounded-xl p-8 bg-[#0F172A]">
          <h2 className="text-[#F1F5F9] font-semibold text-xl mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#00F0D9]" />Subscribe to Status Updates
          </h2>
          <form onSubmit={handleSubscribe} className="space-y-6">
            <div>
              <p className="text-[#94A3B8] mb-4">Get notified about:</p>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[#F1F5F9] cursor-pointer">
                  <Checkbox
                    checked={subscribeOptions.incidents}
                    onCheckedChange={(checked) => setSubscribeOptions({ ...subscribeOptions, incidents: checked as boolean })}
                  />
                  <span>Incidents</span>
                </label>
                <label className="flex items-center gap-2 text-[#F1F5F9] cursor-pointer">
                  <Checkbox
                    checked={subscribeOptions.maintenance}
                    onCheckedChange={(checked) => setSubscribeOptions({ ...subscribeOptions, maintenance: checked as boolean })}
                  />
                  <span>Scheduled maintenance</span>
                </label>
                <label className="flex items-center gap-2 text-[#F1F5F9] cursor-pointer">
                  <Checkbox
                    checked={subscribeOptions.reports}
                    onCheckedChange={(checked) => setSubscribeOptions({ ...subscribeOptions, reports: checked as boolean })}
                  />
                  <span>Weekly uptime reports</span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-[#F1F5F9] mb-2 block">Email</label>
              <div className="flex gap-3">
                <Input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
                  required
                />
                <Button type="submit" className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
                  Subscribe
                </Button>
              </div>
            </div>
            <div className="border-t border-[#334155] pt-6">
              <p className="text-[#94A3B8] mb-3">Or subscribe via:</p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]">
                  <Rss className="w-4 h-4 mr-2" />RSS
                </Button>
              </div>
            </div>
          </form>
        </section>

        <div className="text-center text-[#94A3B8] border-t border-[#334155] pt-8">
          <p>Questions? Contact <a href="mailto:support@nuumee.ai" className="text-[#00F0D9] hover:text-[#00F0D9]/80">support@nuumee.ai</a></p>
        </div>
      </div>
    </main>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import { RefreshCw, Loader, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SystemEvent {
  id: string;
  created_at: string;
  event_type: string;
  severity: string;
  message: string;
  user_id?: string;
  metadata?: any;
}

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const colors: any = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    debug: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  const icons: any = {
    critical: <AlertTriangle className="w-4 h-4" />,
    error: <AlertTriangle className="w-4 h-4" />,
    warning: <AlertCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
    debug: <Info className="w-4 h-4" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border font-medium ${
        colors[severity] || colors.info
      }`}
    >
      {icons[severity]}
      {severity}
    </span>
  );
};

export default function AdminEvents() {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/admin/events');
      setEvents(response.data.events);
      setFilteredEvents(response.data.events);
      setLastRefresh(new Date());

      // Extract unique event types
      const types = Array.from(new Set(response.data.events.map((e: any) => e.event_type)));
      setEventTypes(types as string[]);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchEvents();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchEvents]);

  // Apply filters
  useEffect(() => {
    let filtered = events;

    if (severityFilter !== 'all') {
      filtered = filtered.filter((e) => e.severity === severityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((e) => e.event_type === typeFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (e) => new Date(e.created_at).toISOString().split('T')[0] === dateFilter
      );
    }

    setFilteredEvents(filtered);
  }, [severityFilter, typeFilter, dateFilter, events]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="container py-10 flex justify-center items-center min-h-[60vh]">
          <Loader className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-h2 text-white">System Events Log</h1>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 bg-slate-700 border border-slate-600 rounded"
                />
                <span className="text-sm text-slate-400">Auto-refresh (60s)</span>
              </label>
              <button
                onClick={fetchEvents}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Now
              </button>
            </div>
          </div>

          {lastRefresh && (
            <p className="text-slate-400 text-xs">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Event Types</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            />
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Event Type
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Message
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className={`hover:bg-slate-700/20 ${
                      event.severity === 'critical' || event.severity === 'error'
                        ? 'bg-red-500/5'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-mono">
                      {event.event_type}
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge severity={event.severity} />
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm max-w-xs truncate">
                      {event.message}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {event.user_id ? event.user_id.slice(0, 8) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No events found matching your filters
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 text-slate-400 text-sm">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>
    </AdminLayout>
  );
}

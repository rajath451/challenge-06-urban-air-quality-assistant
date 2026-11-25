import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Mail,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  History,
  Sliders
} from 'lucide-react';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  fetchMyDeliveryLogs,
  NotificationPreferences,
  EmailDeliveryLog
} from '../services/notifications';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  userEmail
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [logs, setLogs] = useState<EmailDeliveryLog[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [enabled, setEnabled] = useState(true);
  const [categories, setCategories] = useState<string[]>([
    'aqi_alerts',
    'daily_briefing',
    'activity_recommendations',
    'weekly_summary'
  ]);
  const [reportTime, setReportTime] = useState('07:00');
  const [location, setLocation] = useState('Mangaluru, Karnataka, India');

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const p = await fetchNotificationPreferences();
      setPrefs(p);
      setEnabled(p.email_notifications_enabled);
      setCategories(p.categories || []);
      setReportTime(p.preferred_report_time || '07:00');
      setLocation(p.preferred_location || 'Mangaluru, Karnataka, India');

      const myLogs = await fetchMyDeliveryLogs();
      setLogs(myLogs);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Please log in to manage notification preferences.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await updateNotificationPreferences({
        email_notifications_enabled: enabled,
        categories,
        preferred_report_time: reportTime,
        preferred_location: location
      });
      setPrefs(updated);
      setFeedback({ type: 'success', text: 'Notification preferences synchronized successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Email Notification Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userEmail ? `Configured for ${userEmail}` : 'Centralized transactional air notifications'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
                activeTab === 'settings'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Subscription & Schedule</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
                activeTab === 'logs'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Delivery History ({logs.length})</span>
            </button>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`mb-4 p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Master Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Receive Email Notifications
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Dispatched from verified sender notifications@vayucoach.in
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Notification Categories */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Subscribed Notification Categories
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={categories.includes('aqi_alerts')}
                      onChange={() => handleToggleCategory('aqi_alerts')}
                      disabled={!enabled}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        🚨 Urgent AQI Warning Notifications
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Real-time alerts triggered when ambient measurements exceed Moderate thresholds (with 6h deduplication).
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={categories.includes('daily_briefing')}
                      onChange={() => handleToggleCategory('daily_briefing')}
                      disabled={!enabled}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        🌤️ Personalized Daily Air-Quality Reports
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Scheduled morning briefing with forecast, optimal workout windows, and coastal sea-breeze timings.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={categories.includes('activity_recommendations')}
                      onChange={() => handleToggleCategory('activity_recommendations')}
                      disabled={!enabled}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        🏃 Activity & Fitness Guidance
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Targeted recommendations to reschedule cardio sprints or modify commute transit modes.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={categories.includes('weekly_summary')}
                      onChange={() => handleToggleCategory('weekly_summary')}
                      disabled={!enabled}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        📊 Weekly Environmental Digest
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        7-day retrospective highlighting clean air days and estimated particulate dose avoided.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Time & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Preferred Daily Briefing Time
                  </label>
                  <select
                    value={reportTime}
                    onChange={(e) => setReportTime(e.target.value)}
                    disabled={!enabled}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="06:00">06:00 AM (Early Dawn)</option>
                    <option value="07:00">07:00 AM (Standard Morning)</option>
                    <option value="08:00">08:00 AM (Commuter Hour)</option>
                    <option value="09:00">09:00 AM (Desk Start)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Monitoring Location Focus
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={!enabled}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Bengaluru, Karnataka, India">Bengaluru Urban (BTM Layout CAAQMS)</option>
                    <option value="New Delhi, India">New Delhi (National Capital Region)</option>
                    <option value="Mumbai, Maharashtra, India">Mumbai (Colaba Coastal Monitor)</option>
                    <option value="Chennai, Tamil Nadu, India">Chennai (Alandur CPCB)</option>
                    <option value="Hyderabad, Telangana, India">Hyderabad (Sanathnagar CAAQMS)</option>
                    <option value="Mangaluru, Karnataka, India">Mangaluru, Karnataka (Kadri Station)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {saving ? 'Synchronizing Preferences...' : 'Save Notification Preferences'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Outbound emails sent to your address:</span>
                <span className="font-mono text-[11px]">{logs.length} Total</span>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No notifications dispatched yet. Registered alerts and reports will appear here.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.subject}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Type: {log.email_type} • {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : log.status === 'SUPPRESSED'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              CAN-SPAM & GDPR Compliant
            </span>
            <span>One-click unsubscribe in every email</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sliders,
  BellRing,
  FileText,
  Activity,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  ArrowRight,
  Mail,
  Send,
  Server,
  Zap,
  CheckCheck
} from 'lucide-react';
import { User, AdminStats, AuditLogEntry } from '../types/auth';
import {
  fetchAdminOverview,
  fetchAdminAuditLogs,
  updateAdminThresholds,
  broadcastAdminAlert
} from '../services/auth';
import {
  fetchSmtpStatus,
  sendAdminTestEmail,
  fetchAllEmailLogs,
  triggerAdminDailyBriefing,
  triggerAdminAqiCheck,
  SmtpStatus,
  EmailDeliveryLog
} from '../services/notifications';

interface AdminDashboardProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onOpenAuth }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailDeliveryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Threshold form state
  const [cautionAqi, setCautionAqi] = useState(60);
  const [severeAqi, setSevereAqi] = useState(120);
  const [emergencyLockdown, setEmergencyLockdown] = useState(false);
  const [updatingThresholds, setUpdatingThresholds] = useState(false);

  // Broadcast form state
  const [advisoryTitle, setAdvisoryTitle] = useState('');
  const [advisoryMessage, setAdvisoryMessage] = useState('');
  const [advisorySeverity, setAdvisorySeverity] = useState<'INFO' | 'WARNING' | 'EMERGENCY'>('WARNING');
  const [targetRegion, setTargetRegion] = useState('All Connected Metropolitan Regions');
  const [broadcasting, setBroadcasting] = useState(false);

  // SMTP Test Email form state
  const [testRecipient, setTestRecipient] = useState('admin@vayucoach.in');
  const [testTemplate, setTestTemplate] = useState('admin_test');
  const [dispatchingTest, setDispatchingTest] = useState(false);
  const [triggeringDaily, setTriggeringDaily] = useState(false);
  const [triggeringAqi, setTriggeringAqi] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [overviewData, logsData, smtpData, emailsData] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminAuditLogs(),
        fetchSmtpStatus(),
        fetchAllEmailLogs()
      ]);
      setStats(overviewData);
      setEmergencyLockdown(overviewData.emergency_advisory_active);
      setAuditLogs(logsData);
      setSmtpStatus(smtpData);
      setEmailLogs(emailsData);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to load administrator telemetry.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingThresholds(true);
    setFeedbackMsg(null);
    try {
      await updateAdminThresholds({
        pm25_caution_limit: cautionAqi,
        pm25_severe_limit: severeAqi,
        enforce_emergency_lockdown: emergencyLockdown,
        advisory_note: 'Calibrated to CPCB Coastal Dispersion Dynamics & Smog Protocol'
      });
      setFeedbackMsg({ type: 'success', text: 'CPCB decision thresholds updated and engine re-calibrated.' });
      const logs = await fetchAdminAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to update thresholds.' });
    } finally {
      setUpdatingThresholds(false);
    }
  };

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryTitle || !advisoryMessage) return;
    setBroadcasting(true);
    setFeedbackMsg(null);
    try {
      const res = await broadcastAdminAlert({
        title: advisoryTitle,
        message: advisoryMessage,
        severity: advisorySeverity,
        target_region: targetRegion,
      });
      setFeedbackMsg({ type: 'success', text: `Advisory broadcasted to citizens: "${res.title}"` });
      setAdvisoryTitle('');
      setAdvisoryMessage('');
      const logs = await fetchAdminAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to broadcast advisory.' });
    } finally {
      setBroadcasting(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;
    setDispatchingTest(true);
    setFeedbackMsg(null);
    try {
      const res = await sendAdminTestEmail(testRecipient, testTemplate);
      setFeedbackMsg({ type: 'success', text: `Test email (${testTemplate}) dispatched to ${testRecipient}. Status: ${res.result.status}` });
      const [emails, logs] = await Promise.all([fetchAllEmailLogs(), fetchAdminAuditLogs()]);
      setEmailLogs(emails);
      setAuditLogs(logs);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Test email dispatch failed.' });
    } finally {
      setDispatchingTest(false);
    }
  };

  const handleTriggerDaily = async () => {
    setTriggeringDaily(true);
    setFeedbackMsg(null);
    try {
      const res = await triggerAdminDailyBriefing();
      setFeedbackMsg({ type: 'success', text: `Daily briefing dispatched to ${res.dispatched_count} user(s) using live telemetry (NAQI ${res.validated_naqi}).` });
      const [emails, logs] = await Promise.all([fetchAllEmailLogs(), fetchAdminAuditLogs()]);
      setEmailLogs(emails);
      setAuditLogs(logs);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Trigger failed.' });
    } finally {
      setTriggeringDaily(false);
    }
  };

  const handleTriggerAqiCheck = async () => {
    setTriggeringAqi(true);
    setFeedbackMsg(null);
    try {
      const res = await triggerAdminAqiCheck(cautionAqi);
      setFeedbackMsg({ type: 'success', text: `Live AQI check evaluated (NAQI ${res.live_naqi} ${res.live_category}). Dispatched ${res.dispatched_alerts} alert(s) respecting deduplication.` });
      const [emails, logs] = await Promise.all([fetchAllEmailLogs(), fetchAdminAuditLogs()]);
      setEmailLogs(emails);
      setAuditLogs(logs);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Trigger failed.' });
    } finally {
      setTriggeringAqi(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Administrator Access Required
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            The Governance & Threshold Calibration console is restricted to authenticated Environmental Officers and Station Administrators.
          </p>
          <div className="space-y-3">
            <button
              onClick={onOpenAuth}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <span>Sign In as Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-500">
              Evaluator Login: Sign in with <span className="font-mono text-indigo-400">admin@vayucoach.in</span> / <span className="font-mono text-indigo-400">Admin@123</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Environmental Authority Mode (RBAC: Admin)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Administrator & Governance Console
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Centralized SMTP notification relays, CPCB decision thresholds, public health advisory dispatches, and immutable security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Authority Session
          </span>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-semibold underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Registered Citizens</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.total_users ?? '—'}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Active user sensitivity profiles</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Centralized SMTP Relay</span>
            <Mail className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {smtpStatus?.smtp_provider.toUpperCase() || 'BREVO SMTP'}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate block">
            {smtpStatus?.smtp_from_email || 'notifications@vayucoach.in'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Outbound Emails Logged</span>
            <Send className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {emailLogs.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Tracked delivery status & retries</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Emergency Protocol State</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold">
            {emergencyLockdown ? (
              <span className="text-rose-600 dark:text-rose-400">ACTIVE LOCKDOWN</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">Standard Guard</span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">CPCB Alert: {stats?.cpcb_alert_status ?? 'NORMAL'}</span>
        </div>
      </div>

      {/* SECTION: CENTRALIZED SMTP EMAIL NOTIFICATION CONTROLS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Centralized SMTP Relay & Automated Notification Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Brevo transactional relay, rate limits ({smtpStatus?.max_emails_per_hour}/hr/user), deduplication ({smtpStatus?.dedup_cooldown_hours}h cooldown), and live validated data grounding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerDaily}
              disabled={triggeringDaily}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{triggeringDaily ? 'Dispatching...' : 'Run Morning Briefing Cycle'}</span>
            </button>
            <button
              onClick={handleTriggerAqiCheck}
              disabled={triggeringAqi}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{triggeringAqi ? 'Evaluating...' : 'Evaluate Live AQI Warnings'}</span>
            </button>
          </div>
        </div>

        {/* Test Email Dispatch Form */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-500" />
            Administrator Test Email Dispatcher
          </h3>
          <form onSubmit={handleSendTestEmail} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                required
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="evaluator@example.com"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Template Preview Type
              </label>
              <select
                value={testTemplate}
                onChange={(e) => setTestTemplate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="admin_test">System Relay Diagnostics (Admin Test)</option>
                <option value="aqi_warning">Urgent AQI Warning Alert</option>
                <option value="daily_briefing">Personalized Daily Morning Report</option>
                <option value="weekly_summary">Weekly Environmental Digest</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={dispatchingTest}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition shadow shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{dispatchingTest ? 'Sending...' : 'Dispatch Test'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Email Delivery Audit Table */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Live Outbound Delivery Status Stream ({emailLogs.length} events)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Centralized Relay: {smtpStatus?.smtp_host}:{smtpStatus?.smtp_port}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Email Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Subject & Diagnostics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
                {emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                      No outbound email logs captured yet. Use "Dispatch Test" above to verify.
                    </td>
                  </tr>
                ) : (
                  emailLogs.slice(0, 15).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {log.recipient_email}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                          {log.email_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SENT'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : log.status === 'SUPPRESSED'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400 max-w-sm truncate">
                        {log.subject} {log.last_error && `• Error: ${log.last_error}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Admin Grids: Thresholds and Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: CPCB Decision Thresholds Tuner */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                CPCB NAQI Decision Thresholds
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              Dynamically adjust Indian National AQI trigger thresholds used by the Decision Engine to recommend outdoor exercise postponement, school recess closures, and mask advisories.
            </p>

            <form onSubmit={handleSaveThresholds} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Caution Cut-off Threshold (PM2.5 µg/m³)</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{cautionAqi} µg/m³</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="5"
                  value={cautionAqi}
                  onChange={(e) => setCautionAqi(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Triggers cautionary yellow advice for asthma and sensitive groups.</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Severe Pollution Emergency Limit (PM2.5 µg/m³)</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">{severeAqi} µg/m³</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="250"
                  step="10"
                  value={severeAqi}
                  onChange={(e) => setSevereAqi(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Enforces mandatory N95 respirators, window seals, and zero strenuous workouts.</span>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <input
                    type="checkbox"
                    checked={emergencyLockdown}
                    onChange={(e) => setEmergencyLockdown(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Enforce Winter Smog Emergency Lockdown
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Overrides automatic forecast windows with immediate indoor shelter guidelines across the city.
                    </span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={updatingThresholds}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-[0.99] transition shadow"
              >
                {updatingThresholds ? 'Saving & Auditing...' : 'Save & Calibrate Engine'}
              </button>
            </form>
          </div>
        </div>

        {/* Section 2: Public Advisory Dispatcher */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                <BellRing className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Broadcast Public Health Advisory
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Dispatch official meteorological air advisories to citizens across connected urban regions and districts.
            </p>

            <form onSubmit={handleBroadcastAlert} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Municipal Jurisdiction
                </label>
                <select
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All Connected Regions">All Connected Metropolitan Regions (Pan-India)</option>
                  <option value="Delhi NCR">Delhi NCR Regional Network</option>
                  <option value="Bengaluru Urban">Bengaluru Urban CAAQMS</option>
                  <option value="Mumbai Metropolitan">Mumbai Metropolitan Coastal Grid</option>
                  <option value="Hyderabad Metro">Hyderabad Regional Grid</option>
                  <option value="Chennai Metro">Chennai Coastal Grid</option>
                  <option value="Mangaluru Metro Area">Mangaluru Metropolitan Grid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Advisory Severity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdvisorySeverity('INFO')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                      advisorySeverity === 'INFO'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    Information
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvisorySeverity('WARNING')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                      advisorySeverity === 'WARNING'
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvisorySeverity('EMERGENCY')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                      advisorySeverity === 'EMERGENCY'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    Emergency
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Advisory Headline
                </label>
                <input
                  type="text"
                  required
                  value={advisoryTitle}
                  onChange={(e) => setAdvisoryTitle(e.target.value)}
                  placeholder="e.g. Temperature Inversion Trap — High Morning PM2.5"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Actionable Public Instructions
                </label>
                <textarea
                  required
                  rows={2}
                  value={advisoryMessage}
                  onChange={(e) => setAdvisoryMessage(e.target.value)}
                  placeholder="Provide concrete action steps: postpone morning sprints until afternoon sea breeze, seal windows during dawn peak..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition shadow shadow-indigo-500/20"
              >
                {broadcasting ? 'Broadcasting...' : 'Broadcast Immediate Advisory'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Security Audit Log Stream */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Security & Decision Audit Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tamper-evident record of threshold updates, admin logins, and broadcast communications.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Showing latest {auditLogs.length} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Actor Email</th>
                <th className="py-2.5 px-3 font-semibold">Event Type</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Details & Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                    {log.actor_email}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                      {log.event_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        log.status === 'success'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-sans max-w-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useCallback } from "react";
import {
  getDoctorDashboard,
  getDoctorAppointments,
  updateAppointmentStatus,
  getDoctorPatients,
  getAvailability,
  addAvailabilitySlots,
  deleteAvailabilitySlot,
  getDoctorAnalytics,
} from "../../api/doctorApi";
import ChatWidget from "../../components/doctor/ChatWidget";
import AvailabilityCalendar from "../../components/doctor/AvailabilityCalendar";
import MedicalRecordModal from "../../components/doctor/MedicalRecordModal";
import PrescriptionModal from "../../components/doctor/PrescriptionModal";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const TABS = ["Overview", "Appointments", "Patients", "Availability", "Analytics"];

export default function DoctorDashboard() {
  const [tab, setTab] = useState("Overview");

  // Overview
  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [apptFilter, setApptFilter] = useState({ status: "", date: "", search: "" });
  const [apptPagination, setApptPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [apptLoading, setApptLoading] = useState(false);

  // Patients
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientPagination, setPatientPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [patientLoading, setPatientLoading] = useState(false);

  // Chat
  const [chatAppointment, setChatAppointment] = useState(null);

  // Modals
  const [recordModal, setRecordModal] = useState(null); // { patientId, appointmentId }
  const [prescriptionModal, setPrescriptionModal] = useState(null); // { patientId, appointmentId }

  // Analytics
  const [analytics, setAnalytics] = useState(null);

  // Load dashboard stats
  useEffect(() => {
    getDoctorDashboard()
      .then((r) => setDashData(r.data))
      .catch(console.error)
      .finally(() => setDashLoading(false));
  }, []);

  // Load appointments
  const loadAppointments = useCallback(async (page = 1) => {
    setApptLoading(true);
    try {
      const params = { page, limit: 10, ...apptFilter };
      const r = await getDoctorAppointments(params);
      setAppointments(r.data.appointments || []);
      setApptPagination(r.data.pagination || { page, pages: 1, total: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setApptLoading(false);
    }
  }, [apptFilter]);

  useEffect(() => {
    if (tab === "Appointments") loadAppointments(1);
  }, [tab, loadAppointments]);

  // Load patients
  const loadPatients = useCallback(async (page = 1) => {
    setPatientLoading(true);
    try {
      const r = await getDoctorPatients({ page, limit: 10, search: patientSearch });
      setPatients(r.data.patients || []);
      setPatientPagination(r.data.pagination || { page, pages: 1, total: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setPatientLoading(false);
    }
  }, [patientSearch]);

  useEffect(() => {
    if (tab === "Patients") loadPatients(1);
  }, [tab, loadPatients]);

  // Load analytics
  useEffect(() => {
    if (tab === "Analytics") {
      getDoctorAnalytics().then((r) => setAnalytics(r.data)).catch(console.error);
    }
  }, [tab]);

  const handleApptStatusChange = async (appointmentId, status) => {
    try {
      await updateAppointmentStatus(appointmentId, { status });
      loadAppointments(apptPagination.page);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ─── Top bar ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {dashData?.doctor?.avatarUrl
            ? <img src={dashData.doctor.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            : <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
                {dashData?.doctor?.fullName?.[0] || "D"}
              </div>
          }
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              Dr. {dashData?.doctor?.fullName || "Loading…"}
            </p>
            <p className="text-xs text-gray-500">{dashData?.doctor?.specialization || ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarBadge rating={dashData?.doctor?.rating} />
        </div>
      </div>

      {/* ─── Tab Nav ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ══════════════════ OVERVIEW ══════════════════ */}
        {tab === "Overview" && (
          <div className="space-y-6">
            {dashLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon="📅" label="Today's Appointments" value={dashData?.stats?.todayAppointments ?? 0} color="teal" />
                  <StatCard icon="⏳" label="Pending" value={dashData?.stats?.pendingAppointments ?? 0} color="yellow" />
                  <StatCard icon="✅" label="Completed" value={dashData?.stats?.completedAppointments ?? 0} color="green" />
                  <StatCard icon="👥" label="Total Patients" value={dashData?.stats?.totalPatients ?? 0} color="blue" />
                </div>

                {/* Recent Appointments */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Today's Appointments</h3>
                    <button onClick={() => setTab("Appointments")} className="text-teal-600 text-sm hover:underline">View all</button>
                  </div>
                  <TodayAppointments doctorUserId={dashData?.doctor} onChat={setChatAppointment} onRecord={setRecordModal} onPrescription={setPrescriptionModal} onStatusChange={handleApptStatusChange} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════ APPOINTMENTS ══════════════════ */}
        {tab === "Appointments" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-wrap gap-3">
                <select
                  value={apptFilter.status}
                  onChange={(e) => setApptFilter((p) => ({ ...p, status: e.target.value }))}
                  className="input-sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="date"
                  value={apptFilter.date}
                  onChange={(e) => setApptFilter((p) => ({ ...p, date: e.target.value }))}
                  className="input-sm"
                />
                <input
                  type="text"
                  placeholder="Search patient name..."
                  value={apptFilter.search}
                  onChange={(e) => setApptFilter((p) => ({ ...p, search: e.target.value }))}
                  className="input-sm flex-1 min-w-48"
                />
                <button onClick={() => loadAppointments(1)} className="btn-primary text-sm">Search</button>
                <button
                  onClick={() => { setApptFilter({ status: "", date: "", search: "" }); }}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {apptLoading ? (
                <div className="p-8 text-center text-gray-400">Loading…</div>
              ) : appointments.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No appointments found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {["Patient", "Date & Time", "Type", "Priority", "Status", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {appointments.map((a) => (
                        <tr key={a._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{a.patientProfile?.fullName || "—"}</p>
                            <p className="text-xs text-gray-400">{a.patientProfile?.patientId || a.patient?.email || ""}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(a.date).toLocaleDateString("en-GB")} · {a.time}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 capitalize">{a.consultationType}</td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={a.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[a.status]}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {a.status === "pending" && (
                                <>
                                  <button onClick={() => handleApptStatusChange(a._id, "confirmed")} className="btn-xs btn-green">Confirm</button>
                                  <button onClick={() => handleApptStatusChange(a._id, "cancelled")} className="btn-xs btn-red">Cancel</button>
                                </>
                              )}
                              {a.status === "confirmed" && (
                                <>
                                  <button onClick={() => handleApptStatusChange(a._id, "completed")} className="btn-xs btn-green">Complete</button>
                                  <button onClick={() => setRecordModal({ patientId: a.patientProfile?._id, appointmentId: a._id })} className="btn-xs btn-blue">Record</button>
                                  <button onClick={() => setPrescriptionModal({ patientId: a.patientProfile?._id, appointmentId: a._id, patientName: a.patientProfile?.fullName })} className="btn-xs btn-teal">Rx</button>
                                  <button onClick={() => setChatAppointment(a)} className="btn-xs btn-gray">Chat</button>
                                </>
                              )}
                              {a.status === "completed" && (
                                <button onClick={() => setChatAppointment(a)} className="btn-xs btn-gray">Chat</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Pagination */}
              {apptPagination.pages > 1 && (
                <Pagination pagination={apptPagination} onPage={loadAppointments} />
              )}
            </div>
          </div>
        )}

        {/* ══════════════════ PATIENTS ══════════════════ */}
        {tab === "Patients" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex gap-3">
              <input
                type="text"
                placeholder="Search by name or patient ID..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="input-sm flex-1"
              />
              <button onClick={() => loadPatients(1)} className="btn-primary text-sm">Search</button>
              <button onClick={() => { setPatientSearch(""); }} className="text-sm text-gray-500 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">Clear</button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {patientLoading ? (
                <div className="p-8 text-center text-gray-400">Loading…</div>
              ) : patients.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No patients found.</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {patients.map((p) => (
                    <div key={p._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        {p.avatarUrl
                          ? <img src={p.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                          : <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 font-semibold text-sm">{p.fullName?.[0]}</div>
                        }
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{p.fullName}</p>
                          <p className="text-xs text-gray-400">{p.patientId} · {p.userId?.email || p.userId?.phone || ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {p.gender && <span className="capitalize">{p.gender}</span>}
                        {p.bloodGroup && <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-600 text-xs">{p.bloodGroup}</span>}
                        <button
                          onClick={() => setRecordModal({ patientId: p._id })}
                          className="btn-xs btn-teal"
                        >Add Record</button>
                        <button
                          onClick={() => setPrescriptionModal({ patientId: p._id, patientName: p.fullName })}
                          className="btn-xs btn-blue"
                        >Prescription</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {patientPagination.pages > 1 && (
                <Pagination pagination={patientPagination} onPage={loadPatients} />
              )}
            </div>
          </div>
        )}

        {/* ══════════════════ AVAILABILITY ══════════════════ */}
        {tab === "Availability" && <AvailabilityCalendar />}

        {/* ══════════════════ ANALYTICS ══════════════════ */}
        {tab === "Analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon="📆" label="This Month" value={analytics?.thisMonthAppointments ?? "—"} color="teal" />
            <StatCard icon="📆" label="Last Month" value={analytics?.lastMonthAppointments ?? "—"} color="blue" />
            <StatCard icon="⭐" label="Avg Rating" value={analytics?.rating ? `${analytics.rating.toFixed(1)} / 5` : "—"} color="yellow" />

            {analytics?.appointmentsByStatus?.length > 0 && (
              <div className="md:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Appointments by Status</h3>
                <div className="flex flex-wrap gap-4">
                  {analytics.appointmentsByStatus.map((s) => (
                    <div key={s._id} className={`px-4 py-3 rounded-xl ${STATUS_COLORS[s._id] || "bg-gray-100 text-gray-700"}`}>
                      <p className="text-2xl font-bold">{s.count}</p>
                      <p className="text-sm capitalize">{s._id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Chat Widget ─────────────────────────────────────── */}
      {chatAppointment && (
        <ChatWidget
          appointment={chatAppointment}
          onClose={() => setChatAppointment(null)}
        />
      )}

      {/* ── Medical Record Modal ─────────────────────────────── */}
      {recordModal && (
        <MedicalRecordModal
          patientId={recordModal.patientId}
          appointmentId={recordModal.appointmentId}
          onClose={() => setRecordModal(null)}
          onSaved={() => { setRecordModal(null); loadAppointments(apptPagination.page); }}
        />
      )}

      {/* ── Prescription Modal ───────────────────────────────── */}
      {prescriptionModal && (
        <PrescriptionModal
          patientId={prescriptionModal.patientId}
          appointmentId={prescriptionModal.appointmentId}
          patientName={prescriptionModal.patientName}
          onClose={() => setPrescriptionModal(null)}
        />
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TodayAppointments({ onChat, onRecord, onPrescription, onStatusChange }) {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    getDoctorAppointments({ date: today, limit: 5 })
      .then((r) => setAppts(r.data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-gray-400 py-4">Loading…</div>;
  if (appts.length === 0) return <p className="text-gray-400 text-sm">No appointments scheduled for today.</p>;

  return (
    <div className="space-y-3">
      {appts.map((a) => (
        <div key={a._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{a.patientProfile?.fullName || "—"}</p>
            <p className="text-xs text-gray-400">{a.time} · {a.consultationType}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[a.status]}`}>{a.status}</span>
            {a.status === "pending" && (
              <button onClick={() => onStatusChange(a._id, "confirmed")} className="btn-xs btn-green">Confirm</button>
            )}
            {(a.status === "confirmed" || a.status === "completed") && (
              <button onClick={() => onChat(a)} className="btn-xs btn-gray">Chat</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  };
  return (
    <div className={`rounded-2xl p-5 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900`}>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function StarBadge({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-full text-sm font-medium">
      ⭐ {Number(rating).toFixed(1)}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    low: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[priority] || map.low}`}>{priority}</span>
  );
}

function Pagination({ pagination, onPage }) {
  const { page, pages, total } = pagination;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
      <p className="text-sm text-gray-500">Total: {total}</p>
      <div className="flex gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="btn-xs btn-gray disabled:opacity-40">←</button>
        <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300">{page} / {pages}</span>
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="btn-xs btn-gray disabled:opacity-40">→</button>
      </div>
    </div>
  );
}

function Skeleton() {
  return <div className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />;
}
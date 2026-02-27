import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Clock,
  User,
  Activity,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getAppointmentById } from "../../api/appointmentApi";
import { PRIORITY_BADGE, STATUS_BADGE, getInitials } from "../../utils/colors";

export default function AppointmentDetailModal({
  appointmentId,
  onClose,
  onConfirm,
  onComplete,
  onChat,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!appointmentId) return;
    setLoading(true);
    getAppointmentById(appointmentId)
      .then((res) => setData(res.data.appointment || res.data))
      .catch(() => setError("Failed to load appointment details."))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "\u2014";

  const patientName =
    data?.patientProfile?.fullName ||
    data?.patientName ||
    data?.patient?.email ||
    "Unknown Patient";
  const avatarUrl = data?.patientProfile?.avatarUrl || null;
  const initials = getInitials(patientName) || patientName[0]?.toUpperCase() || "?";

  return createPortal(
    <div
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[88vh] overflow-y-auto glass-card rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-sm rounded-t-2xl">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-500" /> Appointment Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm py-8 justify-center">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Patient row */}
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={patientName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-400/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-teal-400/20">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {patientName}
                  </p>
                  {data.patientProfile?.patientId && (
                    <p className="text-[11px] text-gray-400">
                      {data.patientProfile.patientId}
                    </p>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {data.priority && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${PRIORITY_BADGE[data.priority] || PRIORITY_BADGE.low}`}
                    >
                      {data.priority}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_BADGE[data.status] || ""}`}
                  >
                    {data.status}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoItem
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Date"
                  value={fmtDate(data.date)}
                />
                <InfoItem
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Time"
                  value={data.time || "\u2014"}
                />
                <InfoItem
                  icon={<Activity className="h-3.5 w-3.5" />}
                  label="Type"
                  value={data.consultationType || data.type || "\u2014"}
                  capitalize
                />
                <InfoItem
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Patient Email"
                  value={data.patient?.email || data.patientProfile?.userId?.email || "\u2014"}
                />
              </div>

              {/* Symptoms */}
              {data.symptoms && (
                <DetailSection title="Symptoms" icon={<Activity className="h-3.5 w-3.5" />}>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {data.symptoms}
                  </p>
                </DetailSection>
              )}

              {/* Notes */}
              {data.notes && (
                <DetailSection title="Notes" icon={<FileText className="h-3.5 w-3.5" />}>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {data.notes}
                  </p>
                </DetailSection>
              )}

              {/* Reschedule History */}
              {data.rescheduleHistory?.length > 0 && (
                <DetailSection title="Reschedule History" icon={<RefreshCw className="h-3.5 w-3.5" />}>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {data.rescheduleHistory.map((r, i) => (
                      <div
                        key={i}
                        className="text-xs bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2 border border-gray-100 dark:border-white/10"
                      >
                        <span className="text-gray-500">
                          {fmtDate(r.previousDate)} {r.previousTime}
                        </span>
                        <span className="mx-1.5 text-gray-300">&rarr;</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {fmtDate(r.newDate)} {r.newTime}
                        </span>
                        {r.reason && (
                          <p className="text-gray-400 mt-0.5">{r.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-white/10">
                {data.status === "pending" && onConfirm && (
                  <button
                    onClick={() => onConfirm(data._id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-md shadow-teal-600/20"
                  >
                    <CheckCircle className="h-4 w-4" /> Confirm
                  </button>
                )}
                {data.status === "confirmed" && onComplete && (
                  <button
                    onClick={() => onComplete(data._id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle className="h-4 w-4" /> Complete
                  </button>
                )}
                {onChat && (
                  <button
                    onClick={() => onChat(data)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-500/10 text-gray-700 dark:text-gray-300 hover:bg-gray-500/20 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" /> Open Chat
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="ml-auto px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function InfoItem({ icon, label, value, capitalize }) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`text-sm font-medium text-gray-800 dark:text-gray-100 truncate ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailSection({ title, icon, children }) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  getAvailability,
  addAvailabilitySlots,
  deleteAvailabilitySlot,
  updateAvailabilitySlot,
} from "../../api/doctorApi";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AvailabilityCalendar() {
  const today = new Date();
  const [viewYear,   setViewYear]   = useState(today.getFullYear());
  const [viewMonth,  setViewMonth]  = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add-slot form
  const [addForm, setAddForm] = useState({ startTime: "09:00", endTime: "09:30" });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  // Edit-slot state  { slotId, startTime, endTime }
  const [editingSlot, setEditingSlot] = useState(null);
  const [updating, setUpdating] = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    getAvailability()
      .then((r) => setSlots(r.data.slots || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const slotsForDate = (dateStr) => slots.filter((s) => s.date === dateStr);

  // ── Add ─────────────────────────────────────────────────────────────────────
  const handleAddSlot = async () => {
    if (!selectedDate) return;
    if (!addForm.startTime || !addForm.endTime) return setError("Start and end time required");
    if (addForm.startTime >= addForm.endTime) return setError("End time must be after start time");
    setError("");
    setSaving(true);
    try {
      const r = await addAvailabilitySlots([
        { date: selectedDate, startTime: addForm.startTime, endTime: addForm.endTime },
      ]);
      setSlots(r.data.slots || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add slot");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteSlot = async (slotId) => {
    try {
      const r = await deleteAvailabilitySlot(slotId);
      setSlots(r.data.slots || slots.filter((s) => s._id !== slotId));
    } catch (e) {
      setError(e?.response?.data?.message || "Cannot delete slot");
    }
  };

  // ── Edit helpers ────────────────────────────────────────────────────────────
  const startEditing = (slot) => {
    setEditingSlot({ slotId: slot._id, startTime: slot.startTime, endTime: slot.endTime });
    setError("");
  };

  const cancelEditing = () => setEditingSlot(null);

  // ── Update ──────────────────────────────────────────────────────────────────
  const handleUpdateSlot = async () => {
    if (!editingSlot) return;
    const { slotId, startTime, endTime } = editingSlot;
    if (!startTime || !endTime) return setError("Start and end time required");
    if (startTime >= endTime) return setError("End time must be after start time");
    setError("");
    setUpdating(true);
    try {
      const r = await updateAvailabilitySlot(slotId, { startTime, endTime });
      setSlots(r.data.slots || []);
      setEditingSlot(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update slot");
    } finally {
      setUpdating(false);
    }
  };

  // ── Calendar nav ────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay   = getFirstDayOfMonth(viewYear, viewMonth);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Calendar ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">◀</button>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{MONTHS[viewMonth]} {viewYear}</h3>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">▶</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
          {[...Array(daysInMonth)].map((_, i) => {
            const day     = i + 1;
            const dateStr = toDateStr(viewYear, viewMonth, day);
            const daySlots   = slotsForDate(dateStr);
            const isToday    = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
            const isSelected = dateStr === selectedDate;
            const isPast     = new Date(dateStr) < new Date(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()));
            const hasBooked  = daySlots.some((s) => s.isBooked);

            return (
              <button
                key={day}
                disabled={isPast}
                onClick={() => { setSelectedDate(dateStr); setEditingSlot(null); setError(""); }}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                  isSelected
                    ? "bg-teal-600 text-white"
                    : isToday
                    ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-300 dark:border-teal-700"
                    : isPast
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {day}
                {daySlots.length > 0 && (
                  <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                    isSelected ? "bg-white" : hasBooked ? "bg-yellow-500" : "bg-teal-500"
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500" />Available</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" />Booked</span>
        </div>
      </div>

      {/* ── Slot Manager ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
        {!selectedDate ? (
          <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
            Select a date to manage slots
          </div>
        ) : (
          <div className="space-y-4 flex-1 flex flex-col">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </h3>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Add slot form */}
            <div className="bg-teal-50 dark:bg-teal-900/10 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-teal-700 dark:text-teal-400">Add New Slot</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Start</label>
                  <input
                    type="time"
                    value={addForm.startTime}
                    onChange={(e) => setAddForm((p) => ({ ...p, startTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">End</label>
                  <input
                    type="time"
                    value={addForm.endTime}
                    onChange={(e) => setAddForm((p) => ({ ...p, endTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleAddSlot}
                disabled={saving}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {saving ? "Adding…" : "+ Add Slot"}
              </button>
            </div>

            {/* Existing slots */}
            <div className="flex-1 space-y-2 overflow-y-auto">
              {loading ? (
                <p className="text-gray-400 text-sm">Loading…</p>
              ) : slotsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No slots for this date. Add one above.</p>
              ) : (
                slotsForDate(selectedDate).map((slot) => (
                  <div key={slot._id} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Slot row */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${slot.isBooked ? "bg-yellow-500" : "bg-green-500"}`} />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        {slot.isBooked && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                            Booked
                          </span>
                        )}
                      </div>

                      {!slot.isBooked && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editingSlot?.slotId === slot._id ? cancelEditing() : startEditing(slot)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium ${
                              editingSlot?.slotId === slot._id
                                ? "bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200"
                                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                            }`}
                          >
                            {editingSlot?.slotId === slot._id ? "Cancel" : "✏ Edit"}
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot._id)}
                            className="text-xs px-2.5 py-1 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium"
                          >
                            🗑 Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline edit panel — only shown for the slot being edited */}
                    {editingSlot?.slotId === slot._id && (
                      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/30 space-y-3">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                          Edit Time
                        </p>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">Start</label>
                            <input
                              type="time"
                              value={editingSlot.startTime}
                              onChange={(e) => setEditingSlot((p) => ({ ...p, startTime: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">End</label>
                            <input
                              type="time"
                              value={editingSlot.endTime}
                              onChange={(e) => setEditingSlot((p) => ({ ...p, endTime: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleUpdateSlot}
                          disabled={updating}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {updating && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                          {updating ? "Saving…" : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
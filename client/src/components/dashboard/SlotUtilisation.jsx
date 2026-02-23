import { COLORS } from "../../utils/colors";

/**
 * SlotUtilisation
 *
 * Props:
 *   data    – array from API:
 *     [{ label, pct, colorKey }]
 *   summary – { total, booked, free } from API (all numbers from backend)
 *   loading – boolean
 *
 * Example usage (DashboardPage):
 *   const totalSlots  = slots.length;
 *   const bookedSlots = slots.filter(s => s.isBooked).length;
 *   const freeSlots   = totalSlots - bookedSlots;
 *   const weekdays    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
 *   const slotData = weekdays.map(day => ({
 *     label:    day,
 *     pct:      Math.round((slots.filter(s => ... day match).length / Math.max(totalSlots,1)) * 100),
 *     colorKey: "teal",
 *   }));
 *   <SlotUtilisation data={slotData} summary={{ total: totalSlots, booked: bookedSlots, free: freeSlots }} />
 */
export default function SlotUtilisation({ data = [], summary = null, loading = false }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
        Slot Utilisation
      </h2>

      {loading ? (
        <div className="space-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-3 w-8 rounded bg-gray-200 dark:bg-white/10" />
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 w-full" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No slot data available. Add availability slots to see utilisation.
        </p>
      ) : (
        <div className="space-y-5">
          {data.map(({ label, pct, colorKey }) => {
            const c = COLORS[colorKey] || COLORS.teal;
            const safePct = Math.min(Math.max(pct || 0, 0), 100);
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {label}
                  </span>
                  <span className={`text-xs font-bold ${c.text}`}>{safePct}%</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                    style={{ width: `${safePct}%` }}
                  />
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                      width: `${safePct}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary — only shown when summary prop is provided (from API) */}
      {summary && (
        <div className="mt-5 pt-4 border-t border-gray-200 dark:border-white/10 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Total Slots", value: summary.total ?? 0 },
            { label: "Booked",      value: summary.booked ?? 0 },
            { label: "Free",        value: summary.free ?? 0 },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-base font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
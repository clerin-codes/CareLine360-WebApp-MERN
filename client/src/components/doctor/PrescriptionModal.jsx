import { useState } from "react";
import { generatePrescriptionPdf } from "../../api/doctorApi";

const emptyMed = () => ({ medicine: "", dosage: "", frequency: "", duration: "", instructions: "" });

export default function PrescriptionModal({ patientId, appointmentId, patientName, onClose }) {
  const [medicines, setMedicines] = useState([emptyMed()]);
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(null); // { fileUrl }
  const [error, setError] = useState("");

  const setMed = (i, key) => (e) => {
    const meds = [...medicines];
    meds[i] = { ...meds[i], [key]: e.target.value };
    setMedicines(meds);
  };

  const handleGenerate = async () => {
    const validMeds = medicines.filter((m) => m.medicine.trim());
    if (validMeds.length === 0) return setError("Add at least one medication");
    if (!patientId) return setError("Patient not found");

    setError("");
    setGenerating(true);
    try {
      const r = await generatePrescriptionPdf({
        patientId,
        appointmentId,
        medicines: validMeds,
        notes,
      });
      setDone({ fileUrl: r.data.fileUrl });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to generate prescription");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Generate Prescription</h2>
            {patientName && <p className="text-xs text-gray-400 mt-0.5">For: {patientName}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {error && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">{error}</div>}

          {done ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-3xl">📋</div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">Prescription Generated!</p>
              <p className="text-sm text-gray-500">The PDF has been uploaded to Cloudinary and saved to the patient's profile.</p>
              <a
                href={done.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                View / Download PDF
              </a>
            </div>
          ) : (
            <>
              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Medications</h3>
                  <button onClick={() => setMedicines((p) => [...p, emptyMed()])} className="text-teal-600 text-sm hover:underline">+ Add</button>
                </div>
                <div className="space-y-3">
                  {medicines.map((med, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex justify-between">
                        <p className="text-xs font-medium text-gray-500">#{i + 1}</p>
                        {medicines.length > 1 && (
                          <button onClick={() => setMedicines((p) => p.filter((_, idx) => idx !== i))} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                        )}
                      </div>
                      <input
                        value={med.medicine}
                        onChange={setMed(i, "medicine")}
                        placeholder="Medicine name *"
                        className="w-full input-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        {["dosage", "frequency", "duration"].map((k) => (
                          <input
                            key={k}
                            value={med[k]}
                            onChange={setMed(i, k)}
                            placeholder={k.charAt(0).toUpperCase() + k.slice(1)}
                            className="input-sm"
                          />
                        ))}
                      </div>
                      <input
                        value={med.instructions}
                        onChange={setMed(i, "instructions")}
                        placeholder="Special instructions"
                        className="w-full input-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Clinical Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes for the patient…"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm">Cancel</button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-2"
            >
              {generating && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {generating ? "Generating PDF…" : "Generate & Upload PDF"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
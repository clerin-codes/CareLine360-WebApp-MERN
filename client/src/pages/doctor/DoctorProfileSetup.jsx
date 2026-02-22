import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDoctorProfile, updateDoctorAvatar } from "../../api/doctorApi";
import { useBase64Image } from "../../hooks/useBase64Image";

const SPECIALIZATIONS = [
  "General Practitioner", "Cardiologist", "Dermatologist", "Neurologist",
  "Orthopedic Surgeon", "Pediatrician", "Psychiatrist", "Radiologist",
  "Oncologist", "Gynecologist", "Ophthalmologist", "ENT Specialist",
  "Endocrinologist", "Urologist", "Pulmonologist", "Gastroenterologist",
];

export default function DoctorProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Base64 avatar hook — no Multer / FormData needed
  const avatar = useBase64Image({ maxSizeMB: 2 });

  const [form, setForm] = useState({
    fullName: "",
    specialization: "",
    qualifications: "",
    experience: "",
    bio: "",
    licenseNumber: "",
    consultationFee: "",
    phone: "",
  });

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Create profile
      await createDoctorProfile({
        ...form,
        qualifications: form.qualifications.split(",").map((q) => q.trim()).filter(Boolean),
        experience: Number(form.experience) || 0,
        consultationFee: Number(form.consultationFee) || 0,
      });

      // 2. Upload avatar as base64 if selected (single JSON request, no FormData)
      if (avatar.base64) {
        await updateDoctorAvatar(avatar.base64);
      }

      navigate("/doctor/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-600 shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your account has been approved! Set up your profile to get started.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s ? "bg-teal-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              }`}>{s}</div>
              {s < 2 && <div className={`w-16 h-1 rounded ${step >= 2 ? "bg-teal-600" : "bg-gray-200 dark:bg-gray-700"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── Step 1: Personal ──────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Personal Information</h2>

              {/* Avatar picker — base64 only, no FormData */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-teal-50 dark:bg-gray-700 border-2 border-teal-200 dark:border-teal-800 flex items-center justify-center flex-shrink-0">
                  {avatar.preview
                    ? <img src={avatar.preview} alt="avatar" className="w-full h-full object-cover" />
                    : <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                  }
                </div>
                <div>
                  {/* Hidden native file input — base64 converted via FileReader */}
                  <input
                    ref={avatar.inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={avatar.handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={avatar.triggerPicker}
                    disabled={avatar.loading}
                    className="bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-sm font-medium px-4 py-2 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors disabled:opacity-50"
                  >
                    {avatar.loading ? "Processing…" : "Upload Photo"}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 2MB</p>
                  {avatar.error && <p className="text-xs text-red-500 mt-1">{avatar.error}</p>}
                </div>
              </div>

              <Field label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="Dr. Jane Smith" required />
              <Field label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="+94 77 123 4567" />
              <Field label="License Number" value={form.licenseNumber} onChange={set("licenseNumber")} placeholder="Medical registration number" />

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!form.fullName.trim()) return setError("Full name is required");
                    setError("");
                    setStep(2);
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Professional ──────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Professional Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Specialization *</label>
                <select
                  value={form.specialization}
                  onChange={set("specialization")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <Field label="Qualifications (comma-separated)" value={form.qualifications} onChange={set("qualifications")} placeholder="MBBS, MD, MRCP" />
              <Field label="Years of Experience" type="number" value={form.experience} onChange={set("experience")} placeholder="5" />
              <Field label="Consultation Fee (LKR)" type="number" value={form.consultationFee} onChange={set("consultationFee")} placeholder="1500" />

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={set("bio")}
                  placeholder="Brief description about your practice..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="text-gray-500 dark:text-gray-400 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !form.specialization}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {loading ? "Saving…" : "Complete Setup"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}
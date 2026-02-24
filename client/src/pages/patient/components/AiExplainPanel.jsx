import { useState } from "react";
import { api } from "../../../api/axios";

export default function AiExplainPanel({ initialText = "" }) {
  const [text, setText] = useState(initialText);
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  const onExplain = async () => {
    setError("");
    setExplanation("");

    if (!text.trim()) {
        setError("Please enter medical text.");
        return;
    }

    try {
        setLoading(true);

        const res = await api.post("/patients/me/ai-explain", {
        text,
        language
        });

        setExplanation(res.data.explanation);

    } catch (e) {
        setError(e?.response?.data?.message || "AI request failed.");
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold">AI Medical Explanation</h2>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Tamil</option>
          <option>Sinhala</option>
        </select>
      </div>

      <textarea
        className="w-full border rounded-xl p-3 min-h-[140px] text-sm"
        placeholder="Paste prescription text, diagnosis, medicine names, ICD code…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={onExplain}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-xl text-sm disabled:opacity-60"
        >
          {loading ? "Explaining..." : "Explain"}
        </button>

        <button
          onClick={() => {
            setText("");
            setExplanation("");
            setError("");
          }}
          className="border px-4 py-2 rounded-xl text-sm"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {explanation && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Explanation</div>
          <div className="text-sm whitespace-pre-wrap bg-gray-50 border rounded-xl p-3">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { api } from "../../api/axios";

const categories = [
  { value: "lab_report", label: "Lab Report" },
  { value: "prescription", label: "Prescription" },
  { value: "scan", label: "Scan" },
  { value: "discharge", label: "Discharge Summary" },
  { value: "other", label: "Other" },
];

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/documents");
      setDocs(res.data.documents || []);
    } catch (e) {
      setMsgType("error");
      setMsg(e.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async () => {
    if (!file) {
      setMsgType("error");
      setMsg("Please choose a file");
      return;
    }

    try {
      setMsg("");
      setMsgType("");

      const fd = new FormData();
      fd.append("document", file);
      fd.append("title", title);
      fd.append("category", category);

      // ✅ IMPORTANT: override JSON header if your axios instance sets it globally
      await api.post("/documents", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsgType("success");
      setMsg("✅ Document uploaded");

      setFile(null);
      setTitle("");
      setCategory("other");
      if (fileRef.current) fileRef.current.value = "";

      await load();
    } catch (e) {
      setMsgType("error");
      setMsg(e.response?.data?.message || "Upload failed");
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setMsgType("success");
      setMsg("✅ Document deleted");
      await load();
    } catch (e) {
      setMsgType("error");
      setMsg(e.response?.data?.message || "Delete failed");
    }
  };

  const removePermanent = async (id) => {
    try {
      await api.delete(`/documents/${id}/permanent`);
      setMsgType("success");
      setMsg("✅ Document deleted permanently");
      await load();
    } catch (e) {
      setMsgType("error");
      setMsg(e.response?.data?.message || "Permanent delete failed");
    }
  };

  const msgClass =
    msgType === "success"
      ? "bg-green-50 text-green-800 ring-1 ring-green-100"
      : msgType === "error"
      ? "bg-red-50 text-red-800 ring-1 ring-red-100"
      : "bg-blue-50 text-blue-800 ring-1 ring-blue-100";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload and manage your medical documents.
            </p>
          </div>
          <a
            href="/patient/dashboard"
            className="px-4 py-2 rounded-xl bg-white ring-1 ring-gray-200 text-sm hover:bg-gray-50 transition"
          >
            Back
          </a>
        </div>

        {msg && <div className={`mb-4 p-3 rounded-xl text-sm ${msgClass}`}>{msg}</div>}

        <div className="bg-white rounded-2xl p-6 ring-1 ring-gray-100 shadow-sm mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-sm text-gray-600">Category</label>
              <select
                className="w-full rounded-xl px-3 py-2 ring-1 ring-gray-200 bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="text-sm text-gray-600">Title (optional)</label>
              <input
                className="w-full rounded-xl px-3 py-2 ring-1 ring-gray-200 bg-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Blood Test - Feb"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-sm text-gray-600">File</label>
              <input
                ref={fileRef}
                type="file"
                className="w-full"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              />
              <div className="text-xs text-gray-500 mt-1">Max 10MB • PDF/Image/DOC/DOCX</div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={upload}
              className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:opacity-95 transition"
            >
              Upload Document
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 ring-1 ring-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-900">My Documents</div>
            <button
              onClick={load}
              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-900 text-sm hover:bg-gray-200 transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : docs.length === 0 ? (
            <div className="text-sm text-gray-500">No documents uploaded yet.</div>
          ) : (
            <div className="space-y-3">
              {docs.map((d) => (
                <div
                  key={d._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-xl ring-1 ring-gray-100 hover:ring-gray-200 transition"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {d.title || d.fileName || "Untitled"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {d.category} • {d.fileSize ? `${(d.fileSize / 1024).toFixed(1)} KB` : "—"}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={d.viewUrl || d.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm hover:opacity-95 transition"
                    >
                      Open
                    </a>
                    <button
                      onClick={() => remove(d._id)}
                      className="px-3 py-2 rounded-xl bg-gray-100 text-gray-900 text-sm hover:bg-gray-200 transition"
                    >
                      Delete (Hide)
                    </button>
                    <button
                      onClick={() => removePermanent(d._id)}
                      className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm hover:opacity-95 transition"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

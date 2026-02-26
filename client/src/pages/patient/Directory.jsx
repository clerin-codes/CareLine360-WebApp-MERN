// import { useEffect, useMemo, useState } from "react";
// import { api } from "../../api/axios";
// import { motion, AnimatePresence } from "framer-motion";

// const fadeUp = {
//   hidden: { opacity: 0, y: 12 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] },
//   }),
// };

// function safeStr(v) {
//   return (v ?? "").toString().trim();
// }

// function pick(obj, keys, fallback = "") {
//   for (const k of keys) {
//     const v = obj?.[k];
//     if (v !== undefined && v !== null && safeStr(v) !== "") return v;
//   }
//   return fallback;
// }

// function normalizeList(data) {
//   if (!data) return [];
//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data.data)) return data.data;
//   if (Array.isArray(data.items)) return data.items;
//   if (Array.isArray(data.records)) return data.records;
//   return [];
// }

// function HospitalCard({ h, active, onClick }) {
//   const name = pick(h, ["name", "hospitalName"], "Hospital");
//   const city = pick(h, ["city", "district", "location"], "");
//   const phone = pick(h, ["phone", "contactNo", "contact"], "");
//   return (
//     <button
//       onClick={onClick}
//       className={
//         "w-full text-left p-4 rounded-3xl border transition " +
//         (active
//           ? "border-gray-900 bg-gray-900 text-white"
//           : "border-gray-100 hover:shadow-sm bg-white")
//       }
//     >
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <div className="text-sm font-semibold">{name}</div>
//           <div className={"text-xs mt-1 " + (active ? "text-white/70" : "text-gray-500")}>
//             {city || "—"}
//           </div>
//           {phone ? (
//             <div className={"text-xs mt-2 " + (active ? "text-white/70" : "text-gray-600")}>
//               📞 {phone}
//             </div>
//           ) : null}
//         </div>
//         <div className={"text-xs px-3 py-1 rounded-full border " + (active ? "bg-white/10 border-white/20" : "bg-gray-50 border-gray-200 text-gray-700")}>
//           Hospital
//         </div>
//       </div>
//     </button>
//   );
// }

// function DoctorCard({ d, active, onClick }) {
//   const name = pick(d, ["fullName", "name"], "Doctor");
//   const spec = pick(d, ["specialization", "speciality", "department"], "");
//   const hospName =
//     typeof d?.hospitalId === "object"
//       ? pick(d.hospitalId, ["name"], "")
//       : pick(d, ["hospitalName"], "");
//   return (
//     <button
//       onClick={onClick}
//       className={
//         "w-full text-left p-4 rounded-3xl border transition " +
//         (active
//           ? "border-gray-900 bg-gray-900 text-white"
//           : "border-gray-100 hover:shadow-sm bg-white")
//       }
//     >
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <div className="text-sm font-semibold">{name}</div>
//           <div className={"text-xs mt-1 " + (active ? "text-white/70" : "text-gray-500")}>
//             {spec || "—"}
//           </div>
//           {hospName ? (
//             <div className={"text-xs mt-2 " + (active ? "text-white/70" : "text-gray-600")}>
//               🏥 {hospName}
//             </div>
//           ) : null}
//         </div>
//         <div className={"text-xs px-3 py-1 rounded-full border " + (active ? "bg-white/10 border-white/20" : "bg-blue-50 border-blue-100 text-blue-700")}>
//           Doctor
//         </div>
//       </div>
//     </button>
//   );
// }

// function InfoRow({ label, value, link }) {
//   const v = safeStr(value);
//   if (!v) return null;
//   return (
//     <div className="flex items-start justify-between gap-4 py-2">
//       <div className="text-xs text-gray-500">{label}</div>
//       {link ? (
//         <a
//           href={link}
//           target="_blank"
//           rel="noreferrer"
//           className="text-sm text-gray-900 underline underline-offset-4"
//         >
//           {v}
//         </a>
//       ) : (
//         <div className="text-sm text-gray-900 text-right">{v}</div>
//       )}
//     </div>
//   );
// }

// export default function Directory() {
//   const [tab, setTab] = useState("hospitals"); // hospitals | doctors
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   const [hospitals, setHospitals] = useState([]);
//   const [doctors, setDoctors] = useState([]);

//   const [selectedHospital, setSelectedHospital] = useState(null);
//   const [selectedDoctor, setSelectedDoctor] = useState(null);

//   const [detailLoading, setDetailLoading] = useState(false);

//   const [q, setQ] = useState("");
//   const [hospitalFilterId, setHospitalFilterId] = useState("all"); // for doctors tab

//   // Initial load
//   useEffect(() => {
//     const run = async () => {
//       setLoading(true);
//       setErr("");
//       try {
//         const [hRes, dRes] = await Promise.all([
//           api.get("/patients/hospital"),
//           api.get("/patients/doctor"),
//         ]);

//         const hList = normalizeList(hRes.data).sort((a, b) =>
//           pick(a, ["name", "hospitalName"], "").localeCompare(pick(b, ["name", "hospitalName"], ""))
//         );
//         const dList = normalizeList(dRes.data).sort((a, b) =>
//           pick(a, ["fullName", "name"], "").localeCompare(pick(b, ["fullName", "name"], ""))
//         );

//         setHospitals(hList);
//         setDoctors(dList);

//         // default selections
//         setSelectedHospital(hList[0] || null);
//         setSelectedDoctor(dList[0] || null);
//       } catch (e) {
//         setErr(e?.response?.data?.message || "Failed to load directory data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     run();
//   }, []);

//   // Fetch details (hospital)
//   const openHospital = async (h) => {
//     setSelectedHospital(h);
//     setDetailLoading(true);
//     try {
//       const id = h?._id || h?.id;
//       if (!id) return;
//       const res = await api.get(`/patients/hospital/${id}`);
//       setSelectedHospital(res.data); // replace with full detail
//     } catch (e) {
//       // keep list item, show error banner
//       setErr(e?.response?.data?.message || "Failed to load hospital details");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   // Fetch details (doctor)
//   const openDoctor = async (d) => {
//     setSelectedDoctor(d);
//     setDetailLoading(true);
//     try {
//       const id = d?._id || d?.id;
//       if (!id) return;
//       const res = await api.get(`/patients/doctor/${id}`);
//       setSelectedDoctor(res.data);
//     } catch (e) {
//       setErr(e?.response?.data?.message || "Failed to load doctor details");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   const hospitalOptions = useMemo(() => {
//     return [{ _id: "all", name: "All Hospitals" }, ...hospitals.map((h) => ({
//       _id: String(h?._id || h?.id),
//       name: pick(h, ["name", "hospitalName"], "Hospital"),
//     }))];
//   }, [hospitals]);

//   const filteredHospitals = useMemo(() => {
//     const qq = q.trim().toLowerCase();
//     if (!qq) return hospitals;
//     return hospitals.filter((h) => {
//       const hay = [
//         pick(h, ["name", "hospitalName"], ""),
//         pick(h, ["city", "district", "location"], ""),
//         pick(h, ["address"], ""),
//         pick(h, ["departments"], ""),
//       ]
//         .flat()
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase();
//       return hay.includes(qq);
//     });
//   }, [hospitals, q]);

//   const filteredDoctors = useMemo(() => {
//     const qq = q.trim().toLowerCase();
//     return doctors.filter((d) => {
//       // hospital filter
//       if (hospitalFilterId !== "all") {
//         const hid =
//           typeof d?.hospitalId === "object"
//             ? String(d.hospitalId?._id || "")
//             : String(d?.hospitalId || "");
//         if (hid !== String(hospitalFilterId)) return false;
//       }

//       if (!qq) return true;
//       const hospName =
//         typeof d?.hospitalId === "object"
//           ? pick(d.hospitalId, ["name"], "")
//           : pick(d, ["hospitalName"], "");

//       const hay = [
//         pick(d, ["fullName", "name"], ""),
//         pick(d, ["specialization", "speciality", "department"], ""),
//         pick(d, ["email"], ""),
//         pick(d, ["phone"], ""),
//         hospName,
//       ]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase();

//       return hay.includes(qq);
//     });
//   }, [doctors, q, hospitalFilterId]);

//   const activeList = tab === "hospitals" ? filteredHospitals : filteredDoctors;

//   const activeDetail = tab === "hospitals" ? selectedHospital : selectedDoctor;

//   const detailTitle =
//     tab === "hospitals"
//       ? pick(activeDetail, ["name", "hospitalName"], "Hospital")
//       : pick(activeDetail, ["fullName", "name"], "Doctor");

//   const detailSubtitle =
//     tab === "hospitals"
//       ? pick(activeDetail, ["city", "district", "location"], "")
//       : pick(activeDetail, ["specialization", "speciality", "department"], "");

//   const detailImage =
//     tab === "hospitals"
//       ? pick(activeDetail, ["imageUrl", "logoUrl"], "")
//       : pick(activeDetail, ["avatarUrl", "imageUrl"], "");

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#f6fbff] to-white p-6">
//       <div className="max-w-7xl mx-auto">
//         <AnimatePresence>
//           {err && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.985 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0 }}
//               className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100"
//             >
//               {err}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Header */}
//         <div className="flex items-center justify-between gap-3 mb-5">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
//               Directory
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Browse hospitals and doctors, then click to view full details.
//             </p>
//           </div>

//           <a
//             href="/patient/dashboard"
//             className="px-4 py-2 rounded-full bg-black text-white text-sm shadow hover:opacity-95"
//           >
//             Back
//           </a>
//         </div>

//         {loading ? (
//           <div className="grid lg:grid-cols-12 gap-5">
//             <div className="lg:col-span-5 h-[600px] rounded-3xl bg-white shadow-sm" />
//             <div className="lg:col-span-7 h-[600px] rounded-3xl bg-white shadow-sm" />
//           </div>
//         ) : (
//           <div className="grid lg:grid-cols-12 gap-5">
//             {/* LEFT */}
//             <motion.div
//               className="lg:col-span-5 bg-white rounded-3xl shadow-sm p-5"
//               variants={fadeUp}
//               initial="hidden"
//               animate="visible"
//               custom={0}
//             >
//               {/* Tabs */}
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setTab("hospitals")}
//                   className={
//                     "flex-1 px-4 py-2 rounded-full text-sm border transition " +
//                     (tab === "hospitals"
//                       ? "bg-gray-900 text-white border-gray-900"
//                       : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
//                   }
//                 >
//                   Hospitals
//                 </button>
//                 <button
//                   onClick={() => setTab("doctors")}
//                   className={
//                     "flex-1 px-4 py-2 rounded-full text-sm border transition " +
//                     (tab === "doctors"
//                       ? "bg-gray-900 text-white border-gray-900"
//                       : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
//                   }
//                 >
//                   Doctors
//                 </button>
//               </div>

//               {/* Search + optional filter */}
//               <div className="mt-4 space-y-3">
//                 <div className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-200">
//                   <input
//                     className="w-full bg-transparent outline-none text-sm"
//                     placeholder={tab === "hospitals" ? "Search hospitals..." : "Search doctors..."}
//                     value={q}
//                     onChange={(e) => setQ(e.target.value)}
//                   />
//                 </div>

//                 {tab === "doctors" && (
//                   <select
//                     className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm outline-none"
//                     value={hospitalFilterId}
//                     onChange={(e) => setHospitalFilterId(e.target.value)}
//                   >
//                     {hospitalOptions.map((opt) => (
//                       <option key={opt._id} value={opt._id}>
//                         {opt.name}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//               </div>

//               {/* List */}
//               <div className="mt-4 space-y-3 max-h-[520px] overflow-auto pr-1">
//                 {activeList.length === 0 ? (
//                   <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
//                     No results.
//                   </div>
//                 ) : tab === "hospitals" ? (
//                   activeList.map((h) => (
//                     <HospitalCard
//                       key={h?._id || h?.id}
//                       h={h}
//                       active={(selectedHospital?._id || selectedHospital?.id) === (h?._id || h?.id)}
//                       onClick={() => openHospital(h)}
//                     />
//                   ))
//                 ) : (
//                   activeList.map((d) => (
//                     <DoctorCard
//                       key={d?._id || d?.id}
//                       d={d}
//                       active={(selectedDoctor?._id || selectedDoctor?.id) === (d?._id || d?.id)}
//                       onClick={() => openDoctor(d)}
//                     />
//                   ))
//                 )}
//               </div>
//             </motion.div>

//             {/* RIGHT */}
//             <motion.div
//               className="lg:col-span-7 bg-white rounded-3xl shadow-sm p-6"
//               variants={fadeUp}
//               initial="hidden"
//               animate="visible"
//               custom={1}
//             >
//               {!activeDetail ? (
//                 <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
//                   Select an item to view details.
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="flex items-center gap-4">
//                       <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
//                         {detailImage ? (
//                           <img src={detailImage} alt="" className="w-full h-full object-cover" />
//                         ) : (
//                           <span className="text-xl">{tab === "hospitals" ? "🏥" : "👨‍⚕️"}</span>
//                         )}
//                       </div>

//                       <div>
//                         <div className="text-2xl font-semibold text-gray-900">{detailTitle}</div>
//                         {detailSubtitle ? (
//                           <div className="text-sm text-gray-600 mt-1">{detailSubtitle}</div>
//                         ) : null}
//                       </div>
//                     </div>

//                     {detailLoading ? (
//                       <div className="text-xs text-gray-500 mt-2">Loading…</div>
//                     ) : (
//                       <div
//                         className={
//                           "text-xs px-3 py-1 rounded-full border " +
//                           (tab === "hospitals"
//                             ? "bg-gray-50 border-gray-200 text-gray-700"
//                             : "bg-blue-50 border-blue-100 text-blue-700")
//                         }
//                       >
//                         {tab === "hospitals" ? "Hospital" : "Doctor"}
//                       </div>
//                     )}
//                   </div>

//                   <div className="mt-5 border-t pt-4">
//                     {tab === "hospitals" ? (
//                       <>
//                         <InfoRow label="Address" value={pick(activeDetail, ["address"], "")} />
//                         <InfoRow label="City" value={pick(activeDetail, ["city", "district", "location"], "")} />
//                         <InfoRow label="Phone" value={pick(activeDetail, ["phone", "contactNo", "contact"], "")} />
//                         <InfoRow label="Email" value={pick(activeDetail, ["email"], "")} />
//                         <InfoRow
//                           label="Website"
//                           value={pick(activeDetail, ["website"], "")}
//                           link={pick(activeDetail, ["website"], "")}
//                         />

//                         {(activeDetail?.departments || []).length ? (
//                           <div className="mt-4">
//                             <div className="text-sm font-semibold text-gray-900">Departments</div>
//                             <div className="mt-2 flex flex-wrap gap-2">
//                               {activeDetail.departments.map((d, idx) => (
//                                 <span
//                                   key={idx}
//                                   className="text-xs px-3 py-2 rounded-full bg-gray-50 border border-gray-200"
//                                 >
//                                   {d}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>
//                         ) : null}

//                         {/* Quick action: filter doctors by this hospital */}
//                         <div className="mt-6 flex gap-3">
//                           <button
//                             onClick={() => {
//                               const id = String(activeDetail?._id || activeDetail?.id || "");
//                               setTab("doctors");
//                               setHospitalFilterId(id || "all");
//                               setQ("");
//                             }}
//                             className="px-4 py-2 rounded-2xl bg-black text-white text-sm hover:opacity-95"
//                           >
//                             View Doctors
//                           </button>
//                           <a
//                             href="/patient/appointments"
//                             className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-sm hover:bg-gray-100"
//                           >
//                             Book Appointment
//                           </a>
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <InfoRow label="Specialization" value={pick(activeDetail, ["specialization", "speciality", "department"], "")} />
//                         <InfoRow label="Phone" value={pick(activeDetail, ["phone", "contactNo", "contact"], "")} />
//                         <InfoRow label="Email" value={pick(activeDetail, ["email"], "")} />

//                         {/* Hospital info if populated */}
//                         {typeof activeDetail?.hospitalId === "object" && activeDetail.hospitalId ? (
//                           <div className="mt-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
//                             <div className="text-sm font-semibold text-gray-900">Hospital</div>
//                             <div className="text-sm text-gray-700 mt-2">
//                               {pick(activeDetail.hospitalId, ["name"], "—")}
//                             </div>
//                             <div className="text-xs text-gray-600 mt-1">
//                               {pick(activeDetail.hospitalId, ["city"], "")}
//                             </div>
//                           </div>
//                         ) : null}

//                         <div className="mt-6 flex gap-3">
//                           <a
//                             href={`/patient/book-appointment?doctorId=${activeDetail?._id || activeDetail?.id}`}
//                             className="px-4 py-2 rounded-2xl bg-black text-white text-sm hover:opacity-95"
//                           >
//                             Book Appointment
//                           </a>
//                           <button
//                             onClick={() => {
//                               // quick open hospital if hospitalId is available
//                               const hid =
//                                 typeof activeDetail?.hospitalId === "object"
//                                   ? activeDetail.hospitalId?._id
//                                   : activeDetail?.hospitalId;

//                               if (!hid) return;

//                               const found = hospitals.find((h) => String(h._id || h.id) === String(hid));
//                               setTab("hospitals");
//                               setQ("");
//                               if (found) openHospital(found);
//                             }}
//                             className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-sm hover:bg-gray-100"
//                           >
//                             View Hospital
//                           </button>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 </>
//               )}
//             </motion.div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

function safeStr(v) {
  return (v ?? "").toString().trim();
}
function pick(obj, keys, fallback = "") {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && safeStr(v) !== "") return v;
  }
  return fallback;
}
function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.records)) return data.records;
  return [];
}

function InfoRow({ label, value, link }) {
  const v = safeStr(value);
  if (!v) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-gray-900 underline underline-offset-4"
        >
          {v}
        </a>
      ) : (
        <div className="text-sm text-gray-900 text-right">{v}</div>
      )}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="text-xs px-3 py-2 rounded-full bg-gray-50 border border-gray-200">
      {children}
    </span>
  );
}

export default function Directory() {
  const [tab, setTab] = useState("hospitals"); // hospitals | doctors
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [err, setErr] = useState("");

  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [q, setQ] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const [hRes, dRes] = await Promise.all([
          api.get("/patients/hospital"),
          api.get("/patients/doctor"),
        ]);

        const hList = normalizeList(hRes.data).sort((a, b) =>
          pick(a, ["name"], "").localeCompare(pick(b, ["name"], ""))
        );

        const dList = normalizeList(dRes.data).sort((a, b) =>
          pick(a, ["fullName"], "").localeCompare(pick(b, ["fullName"], ""))
        );

        setHospitals(hList);
        setDoctors(dList);
        setSelectedHospital(hList[0] || null);
        setSelectedDoctor(dList[0] || null);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load directory data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const openHospital = async (h) => {
    setSelectedHospital(h);
    setDetailLoading(true);
    try {
      const id = h?._id || h?.id;
      const res = await api.get(`/patients/hospital/${id}`);
      setSelectedHospital(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load hospital details");
    } finally {
      setDetailLoading(false);
    }
  };

  const openDoctor = async (d) => {
    setSelectedDoctor(d);
    setDetailLoading(true);
    try {
      const id = d?._id || d?.id;
      const res = await api.get(`/patients/doctor/${id}`);
      setSelectedDoctor(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load doctor details");
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredHospitals = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return hospitals;
    return hospitals.filter((h) => {
      const hay = [
        pick(h, ["name"], ""),
        pick(h, ["city"], ""),
        pick(h, ["address"], ""),
        (h.departments || []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(qq);
    });
  }, [hospitals, q]);

  const filteredDoctors = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return doctors;
    return doctors.filter((d) => {
      const hay = [
        pick(d, ["fullName"], ""),
        pick(d, ["specialization"], ""),
        pick(d, ["phone"], ""),
        pick(d, ["bio"], ""),
        (d.qualifications || []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(qq);
    });
  }, [doctors, q]);

  const list = tab === "hospitals" ? filteredHospitals : filteredDoctors;
  const active = tab === "hospitals" ? selectedHospital : selectedDoctor;

  const title =
    tab === "hospitals" ? pick(active, ["name"], "Hospital") : pick(active, ["fullName"], "Doctor");

  const subtitle =
    tab === "hospitals" ? pick(active, ["city"], "") : pick(active, ["specialization"], "");

  const imageUrl =
    tab === "hospitals" ? pick(active, ["avatarUrl"], "") : pick(active, ["avatarUrl"], "");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6fbff] to-white p-6">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100"
            >
              {err}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Directory</h1>
            <p className="text-gray-600 mt-1">Hospitals and Doctors (click to view details)</p>
          </div>
          <a
            href="/patient/dashboard"
            className="px-4 py-2 rounded-full bg-black text-white text-sm shadow hover:opacity-95"
          >
            Back
          </a>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 h-[600px] rounded-3xl bg-white shadow-sm" />
            <div className="lg:col-span-7 h-[600px] rounded-3xl bg-white shadow-sm" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-5">
            {/* LEFT */}
            <motion.div
              className="lg:col-span-5 bg-white rounded-3xl shadow-sm p-5"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("hospitals")}
                  className={
                    "flex-1 px-4 py-2 rounded-full text-sm border transition " +
                    (tab === "hospitals"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
                  }
                >
                  Hospitals
                </button>
                <button
                  onClick={() => setTab("doctors")}
                  className={
                    "flex-1 px-4 py-2 rounded-full text-sm border transition " +
                    (tab === "doctors"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
                  }
                >
                  Doctors
                </button>
              </div>

              <div className="mt-4 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-200">
                <input
                  className="w-full bg-transparent outline-none text-sm"
                  placeholder={tab === "hospitals" ? "Search hospitals..." : "Search doctors..."}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div className="mt-4 space-y-3 max-h-[520px] overflow-auto pr-1">
                {list.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
                    No results.
                  </div>
                ) : tab === "hospitals" ? (
                  list.map((h) => {
                    const isActive = String(selectedHospital?._id || "") === String(h?._id || "");
                    return (
                      <button
                        key={h?._id}
                        onClick={() => openHospital(h)}
                        className={
                          "w-full text-left p-4 rounded-3xl border transition " +
                          (isActive
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-100 hover:shadow-sm bg-white")
                        }
                      >
                        <div className="text-sm font-semibold">{h.name}</div>
                        <div className={"text-xs mt-1 " + (isActive ? "text-white/70" : "text-gray-500")}>
                          {h.city || "—"}
                        </div>
                        {h.phone ? (
                          <div className={"text-xs mt-2 " + (isActive ? "text-white/70" : "text-gray-600")}>
                            📞 {h.phone}
                          </div>
                        ) : null}
                      </button>
                    );
                  })
                ) : (
                  list.map((d) => {
                    const isActive = String(selectedDoctor?._id || "") === String(d?._id || "");
                    return (
                      <button
                        key={d?._id}
                        onClick={() => openDoctor(d)}
                        className={
                          "w-full text-left p-4 rounded-3xl border transition " +
                          (isActive
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-100 hover:shadow-sm bg-white")
                        }
                      >
                        <div className="text-sm font-semibold">{d.fullName}</div>
                        <div className={"text-xs mt-1 " + (isActive ? "text-white/70" : "text-gray-500")}>
                          {d.specialization || "—"}
                        </div>
                        {d.phone ? (
                          <div className={"text-xs mt-2 " + (isActive ? "text-white/70" : "text-gray-600")}>
                            📞 {d.phone}
                          </div>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* RIGHT */}
            <motion.div
              className="lg:col-span-7 bg-white rounded-3xl shadow-sm p-6"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              {!active ? (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
                  Select an item to view details.
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{tab === "hospitals" ? "🏥" : "👨‍⚕️"}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">{title}</div>
                        {subtitle ? <div className="text-sm text-gray-600 mt-1">{subtitle}</div> : null}
                      </div>
                    </div>

                    {detailLoading ? (
                      <div className="text-xs text-gray-500 mt-2">Loading…</div>
                    ) : (
                      <div
                        className={
                          "text-xs px-3 py-1 rounded-full border " +
                          (tab === "hospitals"
                            ? "bg-gray-50 border-gray-200 text-gray-700"
                            : "bg-blue-50 border-blue-100 text-blue-700")
                        }
                      >
                        {tab === "hospitals" ? "Hospital" : "Doctor"}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t pt-4">
                    {tab === "hospitals" ? (
                      <>
                        <InfoRow label="Hospital ID" value={active.hospitalId} />
                        <InfoRow label="Address" value={active.address} />
                        <InfoRow label="City" value={active.city} />
                        <InfoRow label="Phone" value={active.phone} />
                        <InfoRow label="Email" value={active.email} />
                        <InfoRow label="Website" value={active.website} link={active.website} />

                        {safeStr(active.description) ? (
                          <div className="mt-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                            <div className="text-sm font-semibold text-gray-900">About</div>
                            <div className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                              {active.description}
                            </div>
                          </div>
                        ) : null}

                        {(active.departments || []).length ? (
                          <div className="mt-4">
                            <div className="text-sm font-semibold text-gray-900">Departments</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {active.departments.map((dep, idx) => (
                                <Tag key={idx}>{dep}</Tag>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-6 flex gap-3">
                          <a
                            href="/patient/appointments"
                            className="px-4 py-2 rounded-2xl bg-black text-white text-sm hover:opacity-95"
                          >
                            Book Appointment
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <InfoRow label="Doctor ID" value={active.doctorId} />
                        <InfoRow label="Phone" value={active.phone} />
                        <InfoRow label="Specialization" value={active.specialization} />
                        <InfoRow label="Experience" value={active.experience ? `${active.experience} years` : ""} />
                        <InfoRow label="Consultation Fee" value={active.consultationFee ? `Rs. ${active.consultationFee}` : ""} />
                        <InfoRow label="Rating" value={active.totalRatings ? `${active.rating} (${active.totalRatings} reviews)` : (active.rating ? `${active.rating}` : "")} />
                        <InfoRow label="License No" value={active.licenseNumber} />

                        {safeStr(active.bio) ? (
                          <div className="mt-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                            <div className="text-sm font-semibold text-gray-900">Bio</div>
                            <div className="text-sm text-gray-700 mt-2 whitespace-pre-line">{active.bio}</div>
                          </div>
                        ) : null}

                        {(active.qualifications || []).length ? (
                          <div className="mt-4">
                            <div className="text-sm font-semibold text-gray-900">Qualifications</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {active.qualifications.map((q, idx) => (
                                <Tag key={idx}>{q}</Tag>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {(active.availabilitySlots || []).length ? (
                          <div className="mt-4">
                            <div className="text-sm font-semibold text-gray-900">Availability</div>
                            <div className="mt-2 grid sm:grid-cols-2 gap-2">
                              {active.availabilitySlots.map((s, idx) => (
                                <div key={idx} className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                  <div className="text-sm font-semibold text-gray-900">{s.day || "Day"}</div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {s.startTime || "—"} - {s.endTime || "—"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-6 flex gap-3">
                          <a
                            href={`/patient/book-appointment?doctorId=${active._id}`}
                            className="px-4 py-2 rounded-2xl bg-black text-white text-sm hover:opacity-95"
                          >
                            Book Appointment
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
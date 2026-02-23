import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getDoctorProfile, getDoctorDashboard, getUnreadCount } from "../../api/doctorApi";

// ── Doctor context so any child can read doctor data without prop drilling ──
const DoctorContext = createContext(null);
export const useDoctorContext = () => useContext(DoctorContext);

export default function DashboardLayout({ children }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [doctor, setDoctor] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch real doctor profile
    getDoctorProfile()
      .then((r) => setDoctor(r.data.doctor))
      .catch((err) => {
        if (err?.response?.status === 404 || err?.response?.status === 403) {
          navigate("/doctor/setup");
        }
      })
      .finally(() => setProfileLoading(false));

    // 2. Pending appointment count (sidebar badge)
    getDoctorDashboard()
      .then((r) => setPendingCount(r.data.stats?.pendingAppointments ?? 0))
      .catch(() => {});

    // 3. Unread chat count (topbar bell)
    getUnreadCount()
      .then((r) => setUnreadCount(r.data.unreadCount ?? 0))
      .catch(() => {});
  }, [navigate]);

  // Expose a refreshProfile helper so DoctorProfilePage can trigger a refetch
  const refreshProfile = () => {
    getDoctorProfile()
      .then((r) => setDoctor(r.data.doctor))
      .catch(() => {});
  };

  return (
    <DoctorContext.Provider value={{ doctor, profileLoading, refreshProfile }}>
      <div className="cl-page">
        {/* Sidebar gets REAL doctor data — no hardcoded values */}
        <Sidebar
          active={activePage}
          setActive={setActivePage}
          doctor={doctor}
          pendingCount={pendingCount}
        />

        <div className="cl-right-col">
          {/* Topbar gets REAL doctor data — profile click → navigate */}
          <Topbar
            pageTitle={activePage}
            doctor={doctor}
            unreadCount={unreadCount}
          />

          <main className="cl-main p-6">
            <div className="max-w-screen-2xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DoctorContext.Provider>
  );
}
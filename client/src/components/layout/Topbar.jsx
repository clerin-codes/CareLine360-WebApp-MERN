import { Bell, Search, Moon, Sun, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getInitials } from "../../utils/colors";

/**
 * Topbar
 *
 * Props:
 *   pageTitle   – active page label from DashboardLayout
 *   doctor      – { fullName, specialization, avatarUrl } from API  ← NO hardcoded values
 *   unreadCount – live unread chat message count
 */
export default function Topbar({ pageTitle, doctor, unreadCount = 0 }) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Derived from real API data — no hardcoded strings
  const initials    = getInitials(doctor?.fullName || "D");
  const displayName = doctor?.fullName ? `Dr. ${doctor.fullName}` : "Doctor";

  return (
    <header className="cl-topbar flex items-center justify-between px-6 py-4">

      {/* Left: page title + date */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
          {pageTitle}
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{today}</p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2.5">

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl glass-input cursor-pointer hover:ring-1 hover:ring-teal-400/40 transition-all">
          <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-400">Search patients...</span>
        </div>

        {/* Notifications bell — badge shows only when there are unread messages */}
        <button className="relative p-2.5 rounded-xl glass-btn text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-900" />
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl glass-btn text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark
            ? <Sun className="h-[18px] w-[18px]" />
            : <Moon className="h-[18px] w-[18px]" />
          }
        </button>

        {/* Avatar / profile button — clicking navigates to profile page */}
        <button
          onClick={() => navigate("/doctor/profile")}
          className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl glass-btn transition-colors hover:ring-1 hover:ring-teal-400/40"
          title="View profile"
        >
          {doctor?.avatarUrl ? (
            <img
              src={doctor.avatarUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-teal-400/30 shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-teal-400/30 shrink-0">
              {initials}
            </div>
          )}
          {/* displayName is derived from real doctor.fullName — never hardcoded */}
          <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200">
            {displayName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>

      </div>
    </header>
  );
}
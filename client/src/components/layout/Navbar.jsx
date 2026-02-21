import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const navLinks = [
  { path: "/appointments/book", label: "Book" },
  { path: "/appointments", label: "Appointments" },
  { path: "/appointments/history", label: "History" },
];

export default function Navbar() {
  const { users, currentUser, setCurrentUser } = useUser();
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600">
              CareLine360
            </Link>
            <div className="hidden sm:flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {currentUser && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium capitalize">
                {currentUser.role}
              </span>
            )}
            <select
              value={currentUser?._id || ""}
              onChange={(e) => {
                const user = users.find((u) => u._id === e.target.value);
                setCurrentUser(user);
              }}
              className="block w-48 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-1.5 px-2 border"
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:hidden flex space-x-2 pb-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                location.pathname === link.path
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

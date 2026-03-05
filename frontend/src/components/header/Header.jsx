import { Menu, Bell, Search, User, AlertTriangle, Clock } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Header({ onMenuClick, currentUser }) {
  const [showAlerts, setShowAlerts] = useState(false);

  // Mock alerts for prison management
  const alerts = [
    { id: 1, message: "Inmate health check due", type: "info" },
    { id: 2, message: "Unusual activity detected - Block C", type: "warning" },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 lg:px-6 lg:py-4 z-40 sticky top-0">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* System Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50/50 border border-emerald-500/20 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-xs font-bold tracking-wide text-emerald-700 uppercase">Aegis Online</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Emergency Alert Button */}
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-red-600">Report Issue</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {alerts.length}
              </span>
            </button>

            {/* Alert Dropdown */}
            {showAlerts && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 text-sm">Recent Alerts</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${alert.type === 'warning' ? 'bg-yellow-50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1 ${alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                        <p className="text-sm text-gray-700">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-800 tracking-wide">
                {currentUser?.name || "Admin"}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentUser?.role || "System Lead"}</p>
            </div>
            <NavLink to="/profile">
              <button className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all duration-200 border border-white/20">
                <User className="w-5 h-5 drop-shadow-md" />
              </button>
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}

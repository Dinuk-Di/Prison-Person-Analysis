import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import {
  LayoutDashboard,
  Users,
  Zap,
  Calendar,
  Menu,
  X,
  ChevronLeft,
  UserPlus,
  CameraIcon,
  Shield,
  AlertCircle,
  FileText,
  Settings,
  BarChart3,
} from "lucide-react";

const sidebarItems = [
  {
    section: "MAIN",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
    ]
  },
  {
    section: "MANAGEMENT",
    items: [
      {
        name: "Inmate History",
        path: "/inmates",
        icon: Users,
      },
      {
        name: "Staff",
        path: "/staff",
        icon: UserPlus,
      },
    ]
  }
];

export default function Sidebar({ isOpen, onClose, isMobile, currentUser }) {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/sign-in";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full bg-slate-950 text-slate-300 shadow-2xl shadow-blue-900/20 z-50 transition-transform duration-300 ease-in-out border-r border-slate-800/50
        flex flex-col backdrop-blur-xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isMobile ? "w-80" : "w-64"}
        lg:translate-x-0 lg:static lg:h-screen lg:shadow-none
      `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-cyan-400" />
                </div>
             </div>
            <div>
              <h2 className="text-white font-extrabold tracking-wide text-sm">AEGIS<span className="text-cyan-400">CORE</span></h2>
              <p className="text-slate-400 text-[10px] font-medium tracking-widest uppercase">Health Diagnostics</p>
            </div>
          </div>

          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-600 transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {sidebarItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              {/* Section Label */}
              <div className="px-3 mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {section.section}
                </p>
              </div>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={isMobile ? onClose : undefined}
                      className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative
                      ${
                        isActive
                          ? "bg-blue-600/10 text-cyan-400 border border-blue-500/20 shadow-inner"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                      }
                    `}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${
                              isActive
                                ? "text-cyan-400 shadow-cyan-500/50 drop-shadow-md"
                                : "text-slate-500 group-hover:text-slate-300"
                            }`}
                          />
                          <span className="font-semibold text-sm tracking-wide">{item.name}</span>
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/50">
          <div className="flex items-center justify-between mb-4 p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500 shadow-red-500/50 drop-shadow" />
              <span className="text-[10px] font-bold tracking-wider text-red-400 uppercase">Security Clearance</span>
            </div>
            <span className="text-xs font-black tracking-widest text-red-500">MAX</span>
          </div>
          <button
            className="w-full px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-slate-300 rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all font-semibold text-sm shadow-lg border border-slate-700/50 hover:text-white"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

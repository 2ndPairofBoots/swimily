import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { getProfile } from "@/lib/storage";
import { getLevel } from "@/lib/utils/swim";
import { ChevronDown, Zap, Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/" },
  {
    label: "Train", children: [
      { label: "Log Practice", path: "/log-practice" },
      { label: "Calendar", path: "/calendar" },
      { label: "Workouts", path: "/workouts" },
      { label: "Taper", path: "/taper" },
    ]
  },
  {
    label: "Race", children: [
      { label: "Records", path: "/records" },
      { label: "Race Splits", path: "/race-splits" },
      { label: "Meet Schedule", path: "/meets" },
    ]
  },
  {
    label: "Progress", children: [
      { label: "Analytics", path: "/analytics" },
      { label: "Rewards", path: "/rewards" },
      { label: "AI Trainer", path: "/ai-trainer" },
    ]
  },
  { label: "Profile", path: "/profile" },
];

// Check if a path is active (supports direct links and children)
const isPathActive = (item, pathname) => {
  if (item.path) return item.path === pathname;
  if (item.children) return item.children.some(c => c.path === pathname);
  return false;
};

export default function Layout() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const profile = getProfile();
  const level = getLevel(profile.xp || 0);

  const toggleDropdown = (label) => setOpenDropdown(openDropdown === label ? null : label);

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#111] text-white font-mono flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/10 sticky top-0 z-50 bg-[#111]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="text-cyan-400 font-bold text-xl tracking-wider">SWIMILY</Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${
                      isPathActive(item, location.pathname) ? "text-cyan-400" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.label} <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden shadow-xl min-w-[160px]">
                      {item.children.map(child => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-4 py-2 text-sm transition-colors ${location.pathname === child.path ? "text-cyan-400 bg-cyan-400/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-sm transition-colors ${location.pathname === item.path ? "text-cyan-400" : "text-white/70 hover:text-white"}`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* XP counter */}
          <div className="hidden md:flex items-center gap-2 text-xs text-white/60">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 font-bold">{profile.xp || 0} XP</span>
            <span className="text-white/30">·</span>
            <span className="text-cyan-400">{level.name}</span>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#1a1a1a]">
            <div className="flex items-center gap-2 px-4 py-2 text-xs border-b border-white/10">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 font-bold">{profile.xp || 0} XP</span>
              <span className="text-white/30">·</span>
              <span className="text-cyan-400">{level.name}</span>
            </div>
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <div className="px-4 py-2 text-xs text-white/30 uppercase tracking-wider">{item.label}</div>
                  {item.children.map(child => (
                    <Link key={child.path} to={child.path}
                      className={`block px-6 py-2.5 text-sm transition-colors ${
                        location.pathname === child.path
                          ? "text-cyan-400 bg-cyan-400/5 border-l-2 border-cyan-400"
                          : "text-white/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                      }`}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link key={item.path} to={item.path}
                  className={`block px-4 py-2.5 text-sm transition-colors ${
                    location.pathname === item.path
                      ? "text-cyan-400 bg-cyan-400/5 border-l-2 border-cyan-400"
                      : "text-white/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                  }`}>
                  {item.label}
                </Link>
              )
            )}
          </div>
        )}
      </nav>

      {/* Close dropdown on outside click */}
      {openDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
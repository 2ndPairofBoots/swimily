import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router';
import { Home, Plus, Award, User, Menu } from 'lucide-react';

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const location = useLocation();

  const hideBottomNav = ['/login', '/register', '/onboarding', '/verify-email', '/password-reset'].some((p) =>
    location.pathname.startsWith(p)
  );
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="flex flex-col h-screen max-w-[430px] mx-auto bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto hide-scrollbar ${hideBottomNav ? 'pb-6' : 'pb-20'}`}>
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-[#1a1a1a] dark:bg-[#1a1a1a] light:bg-white border-t border-white/10 light:border-gray-200 safe-area-inset-bottom">
          <div className="flex items-center justify-around h-16 px-2">
            <Link
              to="/"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'text-cyan-500'
                  : 'text-gray-500 light:text-gray-600'
              }`}
            >
              <Home className={`w-6 h-6 mb-0.5 ${isActive('/') && location.pathname === '/' ? 'fill-current' : ''}`} />
              <span className="text-[11px] font-semibold">Home</span>
            </Link>
            
            <Link
              to="/log"
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <div className={`flex items-center justify-center w-14 h-14 rounded-2xl mb-0.5 transition-all ${
                isActive('/log') ? 'bg-cyan-500' : 'bg-white/10 light:bg-gray-100'
              }`}>
                <Plus className={`w-7 h-7 ${isActive('/log') ? 'text-black' : 'text-white light:text-gray-600'}`} strokeWidth={2.5} />
              </div>
              <span className={`text-[11px] font-semibold ${isActive('/log') ? 'text-cyan-500' : 'text-gray-500 light:text-gray-600'}`}>Log</span>
            </Link>
            
            <Link
              to="/records"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive('/records')
                  ? 'text-cyan-500'
                  : 'text-gray-500 light:text-gray-600'
              }`}
            >
              <Award className={`w-6 h-6 mb-0.5 ${isActive('/records') ? 'fill-current' : ''}`} />
              <span className="text-[11px] font-semibold">Records</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive('/profile')
                  ? 'text-cyan-500'
                  : 'text-gray-500 light:text-gray-600'
              }`}
            >
              <User className={`w-6 h-6 mb-0.5 ${isActive('/profile') ? 'fill-current' : ''}`} />
              <span className="text-[11px] font-semibold">Profile</span>
            </Link>
            
            <Link
              to="/more"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive('/more')
                  ? 'text-cyan-500'
                  : 'text-gray-500 light:text-gray-600'
              }`}
            >
              <Menu className="w-6 h-6 mb-0.5" />
              <span className="text-[11px] font-semibold">More</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
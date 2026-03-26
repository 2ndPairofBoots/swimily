import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <RouterProvider router={router} />
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </UserProvider>
    </ThemeProvider>
  );
}
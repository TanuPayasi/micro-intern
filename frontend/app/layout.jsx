import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './globals.css';

export const metadata = {
  title: 'MicroIntern — Skill Swap Marketplace',
  description: 'Post and find micro-internships. Connect, learn, grow.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                background: '#fff',
                color: '#2D3142',
                fontSize: '14px',
                boxShadow: '0 4px 28px rgba(45,49,66,0.12)',
                border: '1px solid #f0ece8',
              },
              success: {
                iconTheme: { primary: '#C9849A', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
import "./globals.css";
import AppLayout from "../components/AppLayout";
import ReduxProvider from "../components/ReduxProvider";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "MediSmile - لوحة التحكم",
  description: "نظام إدارة الحالات السريرية والطلاب",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const isDark = theme === 'dark' || (!theme && prefersDark);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="font-sans min-h-screen transition-colors"
        suppressHydrationWarning
      >
        <ReduxProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster position="top-center" />
        </ReduxProvider>
      </body>
    </html>
  );
}

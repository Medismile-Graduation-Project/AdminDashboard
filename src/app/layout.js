import "./globals.css";
import AppLayout from "../components/AppLayout";
import { Cairo } from "next/font/google";
import ReduxProvider from "../components/ReduxProvider";
import { Toaster } from "react-hot-toast"; 

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "My App",
  description: "Next.js with Sidebar",
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
        className={`${cairo.className} min-h-screen transition-colors`}
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

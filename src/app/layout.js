import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { ThemeScript } from "@/components/ThemeProvider";
import { getSession } from "@/lib/auth";

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "IIIT Resources",
    template: "%s | IIIT Resources",
  },
  description:
    "Course notes, slides, past papers and lecture recordings shared by students at IIIT Hyderabad.",
  icons: { icon: "/logo-mark.png", apple: "/logo-mark.png" },
  openGraph: {
    title: "IIIT Resources",
    description: "Course material shared by students at IIIT Hyderabad.",
    type: "website",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f9" },
    { media: "(prefers-color-scheme: dark)", color: "#131019" },
  ],
};

export default async function RootLayout({ children }) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Providers session={session}>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Navbar />
          <main id="main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

import "./globals.css";
import ThemeProvider from "@/providers/ThemeProvider";
import ThemeContextProvider from "@/context/ThemeContext";
import Navbar from "./components/Navbar/Navbar";
import { getCurrentUser } from "@/actions/getCurrentUser";
import AuthProvider from "@/providers/AuthProvider";

export const metadata = {
  title: " IIITH Resources",
  description: "created by NeverMind",
};

export default async function RootLayout({ children }) {
  const currentUser =  await getCurrentUser();
  return (
    <html lang="en">
      <body>
      <AuthProvider>
          <ThemeContextProvider>
            <ThemeProvider>
              <div className="container">
                <div className="wrapper">
                  <Navbar user={currentUser} />
                  {children}                 
                </div>
              </div>
            </ThemeProvider>
          </ThemeContextProvider>
          </AuthProvider>
      </body>
    </html>
  );
}

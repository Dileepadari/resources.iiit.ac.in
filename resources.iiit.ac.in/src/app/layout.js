import "./globals.css";
import ThemeProvider from "@/providers/ThemeProvider";
import ThemeContextProvider from "@/context/ThemeContext";

export const metadata = {
  title: " IIITH Resources",
  description: "created by NeverMind",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
          <ThemeContextProvider>
            <ThemeProvider>
              <div className="container">
                <div className="wrapper">

                  {children}
                  
                </div>
              </div>
            </ThemeProvider>
          </ThemeContextProvider>
      </body>
    </html>
  );
}

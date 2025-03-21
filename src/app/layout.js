import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { TicketProvider } from "@/context/TicketContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Win With Steemit",
  description: "Join the Steemit Lottery and win exciting prizes!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TicketProvider>
          <Navbar />
          <main>{children}</main>
        </TicketProvider>
      </body>
    </html>
  );
}

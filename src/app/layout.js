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

// ✅ Next.js 13+ uses this for <Head>
export const metadata = {
  title: "Win With Steemit | Daily Blockchain Lottery & STEEM Prizes",
  description:
    "Join the Win With Steemit Lottery – Pick your lucky numbers, win daily STEEM prizes, and unlock surprises using promo & gift codes!",
  openGraph: {
    title: "Win With Steemit | Daily Blockchain Lottery",
    description:
      "Try your luck in the Win With Steemit Lottery. Play daily and win STEEM. It’s fun, fair, and powered by the Steemit blockchain!",
    url: "https://www.winwithsteemit.com",
    siteName: "Win With Steemit",
    images: [
      {
        url: "https://winwithsteemit.com/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Win With Steemit Lottery Banner",
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://www.winwithsteemit.com"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <TicketProvider>
          <Navbar />
          <main>{children}</main>
        </TicketProvider>
      </body>
    </html>
  );
}

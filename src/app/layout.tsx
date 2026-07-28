import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "RentCar - แพลตฟอร์มปล่อยเช่ารถ",
  description: "แพลตฟอร์มตัวกลางเช่ารถระหว่างเจ้าของรถและผู้เช่า",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <SessionProvider session={session}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-surface py-6 text-center text-sm text-ink-faint">
            © {new Date().getFullYear()} RentCar — แพลตฟอร์มตัวกลางเช่ารถ
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}

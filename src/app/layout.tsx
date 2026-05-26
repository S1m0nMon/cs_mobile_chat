import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "채팅 시스템 Beta · Hirediversity",
  description: "모바일 개통 신청 CS 채팅 — PRD Chat Feature v0.1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full overflow-hidden antialiased">{children}</body>
    </html>
  );
}

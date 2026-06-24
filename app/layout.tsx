import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "会偷吃心愿的怒怒",
  description: "把抖音和小红书里的想吃瞬间丢给怒怒，它会偷偷替你记下来。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

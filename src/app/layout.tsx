import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Crew - AI 能力猎头平台 | 找到最适合你的 AI 模型",
  description: "AI Crew 是您的专属 AI 能力猎头，在全球 AI 模型生态中为您挖掘最适合的工具。支持需求分析、模型对比、对决战报，助您快速完成 AI 模型选型。",
  keywords: ["AI 模型", "AI 猎头", "AI 工具对比", "AI 模型选型", "LLM 对比", "DeepSeek", "Claude", "GPT", "AI Crew"],
  authors: [{ name: "AI Crew Team" }],
  openGraph: {
    title: "AI Crew - AI 能力猎头平台",
    description: "在全球 AI 模型生态中为您挖掘最适合的工具",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Crew - AI 能力猎头平台",
    description: "在全球 AI 模型生态中为您挖掘最适合的工具",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AI Crew - AI 能力猎头平台';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div tw="flex flex-col items-center justify-center w-full h-full bg-black text-white">
        <div tw="flex items-center mb-8">
          <div tw="w-16 h-16 bg-white rounded-xl flex items-center justify-center mr-4">
            <span tw="text-black text-3xl font-bold">C</span>
          </div>
          <div>
            <h1 tw="text-4xl font-bold">AI CREW</h1>
            <p tw="text-zinc-500 text-lg">INTELLIGENCE AGENCY</p>
          </div>
        </div>
        <p tw="text-zinc-400 text-xl">AI 能力猎头平台 - 找到最适合你的 AI 模型</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
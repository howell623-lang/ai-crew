'use client'

/**
 * 张力桥图表组件 - 用 SVG 实现"增量上升斜坡"视觉效果
 * 
 * UI/UX 设计铁律：
 * 1. 克制与高级感：主色调为 #0a0a0a，边框用 zinc-800
 * 2. 差异即高亮：只有存在差异（赢了）的一方才高亮
 */
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Model } from './types'

interface TensionBridgeProps {
  oldModel: Model
  newModel: Model
  improvement: number // 百分比
}

export function TensionBridge({ oldModel, newModel, improvement }: TensionBridgeProps) {
  // SVG 坐标系统 (基于 1000x400 的抽象比例)
  const viewBoxWidth = 1000
  const viewBoxHeight = 400
  
  const leftX = 150
  const rightX = 850
  const barWidth = 60
  const baseY = 350
  
  // 计算分数高度 (假设满分 100)
  const leftHeight = (oldModel.score / 100) * 200
  const rightHeight = (newModel.score / 100) * 250 // 右侧拉高一点体现"展望"感
  
  const leftTopY = baseY - leftHeight
  const rightTopY = baseY - rightHeight
  
  // 路径点
  const bridgePath = `M ${leftX + barWidth} ${leftTopY} L ${rightX} ${rightTopY}`

  return (
    <div className="relative w-full aspect-[2/1] min-h-[280px] bg-zinc-950/50 rounded-2xl border border-zinc-800/50 p-6 overflow-hidden">
      {/* 背景网格线 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3f3f46" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 基准线 */}
        <line x1={leftX - 50} y1={baseY} x2={rightX + 110} y2={baseY} stroke="#27272a" strokeWidth="1" />

        {/* 左侧柱子 (虚色) */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <rect 
            x={leftX} y={leftTopY} width={barWidth} height={leftHeight} 
            rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="1"
          />
          <text x={leftX + barWidth / 2} y={baseY + 30} textAnchor="middle" fill="#52525b" className="text-[20px] font-mono">
            {oldModel.name}
          </text>
        </motion.g>

        {/* 右侧柱子 (高亮) */}
        <motion.g initial={{ height: 0 }} animate={{ height: rightHeight }} transition={{ delay: 0.5, duration: 0.8 }}>
          <rect 
            x={rightX} y={rightTopY} width={barWidth} height={rightHeight} 
            rx="4" fill="#047857" stroke="#10b981" strokeWidth="2"
            filter="url(#glow)"
          />
          <text x={rightX + barWidth / 2} y={baseY + 30} textAnchor="middle" fill="#10b981" className="text-[20px] font-bold font-mono">
            {newModel.name}
          </text>
        </motion.g>

        {/* 张力斜坡 */}
        <motion.path
          d={bridgePath}
          stroke="url(#bridgeGradient)"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 1.2 }}
        />
        
        {/* 斜坡阴影区域 */}
        <motion.path
          d={`M ${leftX + barWidth} ${leftTopY} L ${rightX} ${rightTopY} L ${rightX} ${baseY} L ${leftX + barWidth} ${baseY} Z`}
          fill="url(#bridgeGradient)"
          className="opacity-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ delay: 1.5 }}
        />

        {/* 分数气泡 */}
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2, type: 'spring' }}>
          <circle cx={rightX + barWidth / 2} cy={rightTopY - 40} r="25" fill="#10b981" />
          <text x={rightX + barWidth / 2} y={rightTopY - 35} textAnchor="middle" fill="black" className="text-[18px] font-black">
            {newModel.score}
          </text>
        </motion.g>
      </svg>

      {/* 浮动标签 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="h-px w-8 bg-zinc-800" />
        <span className="text-[10px] text-zinc-500 font-mono tracking-[0.2em] uppercase">Tension Bridge Analysis</span>
        <span className="h-px w-8 bg-zinc-800" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="text-4xl font-black text-white/5 opacity-10 font-mono tracking-tighter">
          +{improvement.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}
'use client'

/**
 * X光参数矩阵组件 - 展示新旧模型详细参数对比
 */
import React from 'react'
import { Model } from './types'

interface ParameterMatrixProps {
  oldModel: Model
  newModel: Model
}

export function ParameterMatrix({ oldModel, newModel }: ParameterMatrixProps) {
  // 提取动态参数映射
  const getParamData = () => {
    const defaultParams = [
      { key: 'score', label: '逻辑实力评分', oldVal: oldModel.score, newVal: newModel.score, unit: ' pts' },
      { key: 'vram', label: '硬件显存需求', oldVal: oldModel.vram, newVal: newModel.vram, unit: ' GB' },
    ]

    const extendedKeys = [
      { key: 'context', label: '上下文长度', unit: '' },
      { key: 'speed', label: '推理速度', unit: '' },
      { key: 'latency', label: '接口延迟', unit: ' ms' },
    ]

    const dynamicParams = extendedKeys.map(meta => ({
      key: meta.key,
      label: meta.label,
      oldVal: oldModel.parameters?.[meta.key] || '---',
      newVal: newModel.parameters?.[meta.key] || '---',
      unit: meta.unit
    }))

    return [...defaultParams, ...dynamicParams]
  }

  const params = getParamData()
  
  return (
    <div className="w-full bg-zinc-900/20 rounded-2xl border border-zinc-800/50 overflow-hidden">
      <div className="grid grid-cols-3 border-b border-zinc-800/50 bg-zinc-900/40 px-6 py-3">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">维度 Dimensions</div>
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center leading-none">现有使用工具</div>
        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest text-right leading-none">对标候选模型</div>
      </div>
      
      <div className="divide-y divide-zinc-800/20">
        {params.map((p, i) => {
          // 比较逻辑：数字则比大小，字符串则仅展示
          const isBetter = typeof p.newVal === 'number' && typeof p.oldVal === 'number' 
            ? (p.key === 'vram' || p.key === 'latency' ? p.newVal < p.oldVal : p.newVal > p.oldVal)
            : false

          return (
            <div key={i} className="grid grid-cols-3 px-6 py-4 items-center group hover:bg-white/[0.02] transition-colors">
              <div className="text-[11px] text-zinc-400 font-bold">{p.label}</div>
              <div className="text-xs text-zinc-500 text-center font-mono">{p.oldVal}<span className="text-[10px] opacity-40">{p.unit}</span></div>
              <div className={`text-xs text-right font-mono font-bold ${isBetter ? 'text-emerald-400' : 'text-zinc-300'}`}>
                {p.newVal}<span className={`text-[10px] opacity-40 ${isBetter ? 'text-emerald-500/50' : ''}`}>{p.unit}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
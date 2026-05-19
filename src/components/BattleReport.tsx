'use client'

/**
 * 对决战报页面 - 包含双模式切换和"增量张力桥"图表
 * 
 * UI/UX 设计铁律：
 * 1. 克制与高级感：主色调为 #0a0a0a，边框用 zinc-800
 * 2. 差异即高光：只有存在差异（赢了）的一方才高亮
 * 3. 摒弃废话术语：直接使用"当前使用模型"、"强力推荐工具"、"普通对比"、"详细参数"
 */
import React, { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { Share, Download, Image as ImageIcon, Check, Loader2, Crown } from 'lucide-react'
import { TensionBridge } from './TensionBridge'
import { ParameterMatrix } from './ParameterMatrix'
import { Model, ViewMode } from './types'

interface BattleReportProps {
  oldModel: Model
  newModel: Model
  partnerModel?: Model
  improvement: number // 百分比
  requestedTasks?: string[]
  isPro?: boolean
  onUpgrade?: () => void
}

export function BattleReport({ 
  oldModel, 
  newModel, 
  partnerModel, 
  improvement, 
  requestedTasks = [], 
  isPro = false,
  onUpgrade 
}: BattleReportProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('simple')
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  
  const toggleViewMode = () => {
    setViewMode(viewMode === 'simple' ? 'detailed' : 'simple')
  }

  const exportImage = async () => {
    if (reportRef.current === null) return
    if (!isPro) {
      onUpgrade?.()
      return
    }
    
    setIsExporting(true)
    try {
      const dataUrl = await toPng(reportRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
        style: {
          padding: '40px',
        }
      })
       download(dataUrl, `AI-Crew-Report-${newModel.name}.png`)
    } catch (err) {
      console.error('Oops, something went wrong!', err)
    } finally {
      setIsExporting(false)
    }
  }

  const CandidateDossier = ({ model, isPrimary = true, masked = false }: { model: Model, isPrimary?: boolean, masked?: boolean }) => (
    <div className={`relative p-6 rounded-3xl border transition-all ${isPrimary ? 'bg-zinc-900/50 border-zinc-700' : 'bg-zinc-900/20 border-zinc-800'} ${masked ? 'overflow-hidden' : ''}`}>
      {masked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md p-6 text-center">
          <Crown className="w-8 h-8 text-amber-500 mb-2 scale-110" />
          <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">PRO INTEL ONLY</div>
          <button 
            onClick={(e) => { e.stopPropagation(); onUpgrade?.() }}
            className="text-[10px] text-zinc-400 underline underline-offset-4 hover:text-white"
          >
            解锁王牌合伙人建议
          </button>
        </div>
      )}

      <div className={`flex justify-between items-start mb-6 ${masked ? 'blur-sm' : ''}`}>
        <div>
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-1">
            {isPrimary ? '核心匹配工具 / Primary Tool' : '专项辅助工具 / Specialist Tool'}
          </div>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{model.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 font-mono italic text-zinc-400">SCORE / 综合评分</div>
          <div className="text-xl font-black text-emerald-500">{model.score}</div>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-4 mb-6 ${masked ? 'blur-sm' : ''}`}>
        <div className="space-y-1">
          <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">性能表现 / Rank</div>
          <div className="text-xs text-zinc-300 font-medium">{model.parameters?.roi || '高级'}级实力</div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">推理性能 / Performance</div>
          <div className="text-xs text-zinc-300 font-medium">{model.parameters?.speed || '极速'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">使用价格 / Pricing</div>
          <div className="text-xs text-zinc-300 font-medium">{model.parameters?.salary || '面议'} / 1M Tokens</div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">部署模式 / Deployment</div>
          <div className="text-xs text-zinc-300 font-medium">{model.vram > 0 ? '本地私有化部署' : '云端 API 服务'}</div>
        </div>
      </div>

      <div className={`space-y-2 ${masked ? 'blur-sm' : ''}`}>
        <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-2 text-center border-b border-zinc-800 pb-1">任务覆盖范围 / Capability Coverage</div>
        <div className="flex flex-wrap gap-1.5">
          {model.capabilities?.map(cap => (
            <span key={cap} className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase
              ${requestedTasks.includes(cap) 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-zinc-800/50 text-zinc-600 border border-zinc-700/50'}`}
            >
              {cap}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center bg-zinc-900/30 p-2 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('simple')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'simple' 
                ? 'bg-zinc-100 text-black shadow-lg' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            匹配报告 / Overview
          </button>
          <button
            onClick={() => {
              if (!isPro) onUpgrade?.()
              else setViewMode('detailed')
            }}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all relative
              ${viewMode === 'detailed' 
                ? 'bg-zinc-100 text-black shadow-lg' 
                : 'text-zinc-500 hover:text-zinc-300'}
            `}
          >
            技术参数 / Full Intel
            {!isPro && <Crown className="w-2 h-2 text-amber-500 absolute -top-1 -right-1" />}
          </button>
        </div>

        <button
          onClick={exportImage}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
          人才报批出片 {!isPro && <Crown className="w-2 h-2 text-amber-500 ml-1" />}
        </button>
      </div>

      {/* 可供捕获的战报区域 */}
      <div ref={reportRef} className="rounded-[3rem] overflow-hidden border border-zinc-800 bg-[#0a0a0a] shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="p-10 space-y-12 relative z-10">
          {/* Header */}
          <div className="flex justify-between items-end border-b border-zinc-800 pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-white text-black text-[9px] font-black uppercase tracking-tighter">
                {isPro ? 'Verified Intelligence' : 'Highly Confidential'}
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Poaching Dossier</h2>
               <p className="text-zinc-500 text-xs font-mono tracking-widest">REPORT ID: CREW-{new Date().getTime().toString(36).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <div className="text-zinc-500 text-[10px] font-mono mb-1 leading-none italic uppercase">Matching Confidence</div>
              <div className="text-6xl font-black text-white italic tracking-tighter leading-none">{(improvement + 100).toFixed(0)}<span className="text-xl text-emerald-500">%</span></div>
            </div>
          </div>

          {/* Candidates Display */}
          <div className={`grid gap-6 ${partnerModel ? 'md:grid-cols-2' : 'grid-cols-1 max-w-xl mx-auto'}`}>
            <CandidateDossier model={newModel} />
            {partnerModel && <CandidateDossier model={partnerModel} isPrimary={false} masked={!isPro} />}
          </div>

          <div className="pt-6">
            <TensionBridge oldModel={oldModel} newModel={newModel} improvement={improvement} />
          </div>

          {viewMode === 'detailed' && isPro && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <ParameterMatrix oldModel={oldModel} newModel={newModel} />
            </div>
          )}

          {/* Dossier Footer */}
          <div className="pt-10 flex justify-between items-start border-t border-zinc-900">
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-300 font-black tracking-tight uppercase italic">Active Capability Grid:</div>
              <div className="flex flex-wrap gap-2">
                {requestedTasks.map(t => <span key={t} className="text-[9px] text-zinc-600 font-mono">#{t.toUpperCase()}</span>)}
              </div>
            </div>
            <div className="text-right space-y-1">
               <div className="text-[10px] text-zinc-500 font-mono italic uppercase">AI Crew Intel Terminal</div>
              <div className="text-[10px] text-zinc-300 font-black tracking-tighter uppercase leading-none">专注 AI 深度挖掘与选型</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
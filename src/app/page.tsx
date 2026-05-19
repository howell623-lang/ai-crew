'use client'

import React, { useState, useEffect } from 'react'
import { BattleReport, Onboarding, OnboardingData, Model, DiscoveryPulse, TalentPool, PricingModal } from '../components'
import { fetchModels } from '../lib/models'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, Target, Cpu, Globe, Settings, Crown } from 'lucide-react'

export default function Home() {
  const [navMode, setNavMode] = useState<'hunt' | 'pool'>('hunt')
  const [region, setRegion] = useState<'CN' | 'US'>('CN')
  const [isPro, setIsPro] = useState(false)
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [models, setModels] = useState<{ 
    oldModel: Model; 
    newModel: Model;
    partnerModel?: Model;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (onboardingData) {
      huntBestMatches(onboardingData)
    }
  }, [onboardingData])

  const huntBestMatches = async (data: OnboardingData) => {
    setIsLoading(true)
    try {
      // 从静态 JSON 获取所有模型
      const allModels = await fetchModels()

      // 1. 获取现有锚点
      const currentModelList = allModels.filter(m => data.currentModels.includes(m.name))
      const currentBest = currentModelList.length > 0 
        ? currentModelList.reduce((best, m) => m.score > best.score ? m : best)
        : { name: '现有团队', score: 80, vram: 0, capabilities: [] }

      // 2. 核心猎聘逻辑：查找覆盖用户任务的模型
      const scoredCandidates = allModels
        .filter(m => m.type === 'cloud' || (m.type === 'local' && m.vram <= data.vram))
        .map(model => {
          const matchedTasks = (model.capabilities || []).filter(c => data.tasks.includes(c))
          const coverageRatio = matchedTasks.length / data.tasks.length
          const matchScore = model.score * coverageRatio
          return { ...model, matchedTasks, matchScore }
        })
        .filter(m => m.matchedTasks.length > 0)
        .sort((a, b) => b.matchScore - a.matchScore)

      const bestCandidate = scoredCandidates[0]
      if (!bestCandidate) throw new Error('No talent found')

      // 3. 查找合伙人模型（覆盖缺失任务）
      const missingTasks = data.tasks.filter(task => !bestCandidate.matchedTasks.includes(task))
      let partnerModel: Model | undefined = undefined

      if (missingTasks.length > 0) {
        const partnerCandidates = allModels
          .filter(m => m.id !== bestCandidate.id)
          .filter(m => m.type === 'cloud' || (m.type === 'local' && m.vram <= data.vram))
          .map(model => {
            const matchedMissing = (model.capabilities || []).filter(c => missingTasks.includes(c))
            return { ...model, matchedMissingCount: matchedMissing.length }
          })
          .filter(m => m.matchedMissingCount > 0)
          .sort((a, b) => b.matchedMissingCount - a.matchedMissingCount)

        if (partnerCandidates.length > 0) {
          partnerModel = {
            name: partnerCandidates[0].name,
            vram: partnerCandidates[0].vram,
            score: partnerCandidates[0].score,
            capabilities: partnerCandidates[0].capabilities,
            provider: partnerCandidates[0].provider,
            parameters: partnerCandidates[0].parameters
          }
        }
      }

      setModels({
        oldModel: {
          name: currentBest.name,
          vram: currentBest.vram || 0,
          score: currentBest.score,
          capabilities: currentBest.capabilities || [],
          parameters: currentBest.parameters
        },
        newModel: {
          name: bestCandidate.name,
          vram: bestCandidate.vram,
          score: bestCandidate.score,
          capabilities: bestCandidate.capabilities || [],
          parameters: bestCandidate.parameters
        },
        partnerModel
      })
    } catch (error) {
      console.error('Hunting Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const viewDetailedProfile = (model: Model) => {
    setModels({
      oldModel: { name: '标准测试基准', score: 80, vram: 0 },
      newModel: model,
    })
    setOnboardingData({ 
      tasks: model.capabilities || [], 
      currentModels: [], 
      vram: model.vram || 8 
    })
    setNavMode('hunt')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 pb-24 overflow-x-hidden">
      {/* 开发者辅助工具栏 */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-6 py-2 flex justify-between items-center text-[10px] font-mono sticky top-0 z-[60] backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-zinc-600 uppercase font-black">Region Context:</span>
            <button onClick={() => setRegion('CN')} className={`px-2 py-0.5 rounded transition-all ${region === 'CN' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>CHINA (¥)</button>
            <button onClick={() => setRegion('US')} className={`px-2 py-0.5 rounded transition-all ${region === 'US' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>GLOBAL ($)</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-600 uppercase font-black">Monetization Status:</span>
            <button 
              onClick={() => { if (!isPro) setIsPricingOpen(true); else setIsPro(false) }} 
              className={`px-3 py-0.5 rounded flex items-center gap-1.5 transition-all ${isPro ? 'bg-amber-500 text-black font-black' : 'text-zinc-500 hover:text-zinc-300 border border-zinc-800'}`}
            >
              <Crown className="w-3 h-3" /> {isPro ? 'LIFETIME PRO' : 'FREE MODE'}
            </button>
          </div>
        </div>
        <div className="hidden lg:block text-zinc-700 italic tracking-widest font-black uppercase">Internal Deployment Preview</div>
      </div>

      <header className="max-w-6xl mx-auto p-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <span className="text-black font-black text-2xl italic leading-none">C</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-[900] tracking-tighter italic uppercase leading-none text-white">AI CREW</h1>
            <span className="text-[10px] text-zinc-600 font-mono tracking-[0.3em] uppercase">Intelligence Agency</span>
          </div>
        </div>

        <nav className="flex gap-1.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-[1.5rem] shadow-2xl">
          <button 
            onClick={() => setNavMode('hunt')}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${navMode === 'hunt' ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-zinc-500 hover:text-white'}`}
          >
            <Target className="w-4 h-4" /> {region === 'CN' ? '智能寻猎' : 'Crew'}
          </button>
          <button 
            onClick={() => setNavMode('pool')}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${navMode === 'pool' ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-zinc-500 hover:text-white'}`}
          >
            <LayoutGrid className="w-4 h-4" /> {region === 'CN' ? '人才大盘' : 'Market'}
          </button>
        </nav>

        <div className="hidden xl:flex flex-col items-end text-right">
          <span className="text-[10px] text-zinc-500 font-mono italic leading-none">PULSE: ACTIVE</span>
          <span className="text-[10px] text-emerald-500 font-mono tracking-widest animate-pulse leading-none mt-1">● SCANNING GLOBAL MARKETS</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-10 pb-20">
        <AnimatePresence mode="wait">
          {navMode === 'hunt' ? (
            <motion.div key="hunt" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-16">
              {!onboardingData ? (
                <div className="py-12 flex justify-center">
                  <Onboarding onComplete={setOnboardingData} />
                </div>
              ) : isLoading || !models ? (
                <div className="py-48 flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 border-[6px] border-zinc-900 border-t-white rounded-full animate-spin shadow-2xl" />
                  <div className="text-zinc-500 font-black text-xs tracking-[0.4em] uppercase italic animate-pulse">Running Talent Heuristics...</div>
                </div>
              ) : (
                <div className="space-y-16 animate-in fade-in duration-700">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b border-zinc-900 pb-12">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                         Matching Algorithm 2.1 Complete
                      </div>
                      <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Market Intelligence Dossier</h2>
                      <p className="text-zinc-500 text-base max-w-xl font-medium">
                        {region === 'CN' ? '基于深度背调引擎，为您锁定了该赛道目前效能 ROI 最优的配置方案。' : 'Deep-scan completed. We have identified the optimal AI toolchain ROI for your specific JD requirements.'}
                      </p>
                    </div>
                    <button 
                      onClick={() => { setOnboardingData(null); setModels(null); }} 
                      className="text-xs text-zinc-600 hover:text-white underline underline-offset-8 decoration-zinc-800 hover:decoration-white transition-all font-black uppercase tracking-widest italic"
                    >
                      Reset Requirements Matrix
                    </button>
                  </div>

                  <BattleReport 
                    oldModel={models.oldModel} 
                    newModel={models.newModel} 
                    partnerModel={models.partnerModel}
                    improvement={models.oldModel.score > 0 ? ((models.newModel.score - models.oldModel.score) / models.oldModel.score) * 100 : 0} 
                    requestedTasks={onboardingData.tasks}
                    isPro={isPro}
                    onUpgrade={() => setIsPricingOpen(true)}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="p-12 bg-zinc-900/40 rounded-[4rem] border border-zinc-800 backdrop-blur-3xl group hover:border-zinc-700 transition-all shadow-2xl relative overflow-hidden">
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 blur-[50px]" />
                      <div className="inline-flex px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-black uppercase mb-6 tracking-[0.2em]">
                        {isPro ? 'Verified Verdict' : 'Advanced Intel Locked'}
                      </div>
                      <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none">
                        {models.partnerModel ? '建议采用复合组网方案' : '建议立即全量切入'}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-10 font-medium">
                        {region === 'CN' 
                          ? `针对 ${models.newModel.name} 的分析显示，它在现有硬件环境下存在极高的协同潜力。`
                          : `The intelligence on ${models.newModel.name} suggests extreme performance overhead within your current VRAM environment.`}
                        {models.partnerModel && !isPro ? (region === 'CN' ? ' 更多关于"专项协作模型"的对标数据已在专业版中解锁。' : ' Additional Specialist Partner matching metrics are available in the Lifetime Pro version.') : ''}
                      </p>
                      {!isPro && (
                        <button 
                          onClick={() => setIsPricingOpen(true)} 
                          className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.1em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                          <Crown className="w-4 h-4" /> {region === 'CN' ? '获取终身专业授权' : 'Unlock Lifetime Pro Access'}
                        </button>
                      )}
                    </div>
                    
                    <div className="p-12 bg-zinc-900/20 rounded-[4rem] border-2 border-zinc-800/30 border-dashed flex flex-col justify-center gap-8 relative grayscale hover:grayscale-0 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] text-zinc-600 font-black uppercase italic tracking-[0.3em]">Market Sentiment Analysis</span>
                      </div>
                      <p className="text-zinc-500 text-sm italic font-medium leading-relaxed">
                        {region === 'CN' 
                          ? '"目前中文语境及代码逻辑领域，DeepSeek-V3 已成为最具性价比的首选。建议在内部业务中开启灰度对标测试。"' 
                          : '"Claude 3.5 Sonnet continues to hold the peak efficiency rank in creative-coding duo tasks. Expect new competitor scans in 48 hours."'}
                      </p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-0.5 w-6 bg-zinc-800" />)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="pool" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              <TalentPool onSelect={viewDetailedProfile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} region={region} />
      <DiscoveryPulse />
      
      {/* 底部渐变遮盖 */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-30" />
    </div>
  )
}
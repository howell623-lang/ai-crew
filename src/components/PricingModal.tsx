'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Zap, Crown, CreditCard } from 'lucide-react'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  region: 'CN' | 'US'
}

export function PricingModal({ isOpen, onClose, region }: PricingModalProps) {
  const isCN = region === 'CN'

  const tiers = [
    {
      name: 'Free Scout',
      price: '0',
      period: isCN ? '永久' : 'Forever',
      features: isCN ? ['每日 1 次智能对标报告', '基础数据对比', '标准导出质量'] : ['1 Scan per day', 'Basic intel', 'Standard export'],
      isPro: false,
    },
    {
      name: 'Lifetime License',
      price: isCN ? '9.9' : '14.99',
      symbol: isCN ? '¥' : '$',
      period: isCN ? '一次性付清' : 'One-time',
      features: isCN ? [
        '永久解锁全网模型数据',
        '解锁“复合专家对标 (Power Duo)”',
        '终身数据实时更新 (Live Pulse)',
        '4K 超清报告出片 (无水印)',
        'X 射线深度技术背调',
      ] : [
        'Lifetime data access',
        'Unlock Power Duo metrics',
        'Lifetime Live Pulse updates',
        'No-watermark 4K exports',
        'Full X-Ray technical matrix',
      ],
      isPro: true,
      popular: true,
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-zinc-900 border border-white/10 p-10 rounded-[3.5rem] max-w-4xl w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* 饰纹装饰 */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="absolute top-0 right-0 p-8">
              <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-600 hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-black uppercase tracking-[0.2em]">
                <Crown className="w-3.5 h-3.5" /> Permanent Agency Access
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                {isCN ? '一次买断，终身猎取' : 'Buy Once, Hunt Forever'}
              </h2>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto font-medium">
                {isCN ? '远离订阅焦虑。一次付费即可获取持续更新的全球 AI 能力背调数据。' : 'Say goodbye to subscription fatigue. One-time payment for perpetual AI intelligence updates.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tiers.map((tier) => (
                <div 
                  key={tier.name}
                  className={`relative p-10 rounded-[3rem] border-2 flex flex-col h-full transition-all
                    ${tier.popular 
                      ? 'bg-white border-white text-black scale-105 shadow-2xl z-10' 
                      : 'bg-zinc-800/20 border-zinc-800/50 text-zinc-400'}
                  `}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-6 py-1 bg-black text-white text-[11px] font-black uppercase tracking-tighter rounded-full border-2 border-white">
                      LIMITED TIME OFFER
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.25em] mb-2">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black italic tracking-tighter">{tier.symbol}{tier.price}</span>
                      <span className={`text-[10px] font-bold uppercase ${tier.popular ? 'text-zinc-500' : 'text-zinc-600'}`}>/ {tier.period}</span>
                    </div>
                    {tier.isPro && (
                      <div className="mt-2 text-[10px] font-bold text-zinc-400 line-through decoration-amber-500/50">
                        WAS {tier.symbol}{isCN ? '19.9' : '29.9'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4 mb-10">
                    {tier.features.map(f => (
                      <div key={f} className="flex gap-3 text-xs font-bold leading-tight">
                        <Check className={`w-4 h-4 shrink-0 ${tier.popular ? 'text-black' : 'text-emerald-500'}`} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    className={`w-full py-5 rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest transition-all flex items-center justify-center gap-2
                      ${tier.popular 
                        ? 'bg-black text-white hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.1)]' 
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'}
                    `}
                  >
                    {tier.isPro ? (isCN ? '立即终身买断' : 'Unlock Lifetime') : (isCN ? '当前等级' : 'Current Tier')}
                    {tier.isPro && <Zap className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center space-y-2">
              <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                Trusted by 4,000+ AI Hunters Globally
              </div>
              <div className="text-[9px] text-zinc-700 font-mono italic">
                SECURE CHECKOUT VIA {isCN ? 'WECHAT / ALIPAY / APP STORE' : 'STRIPE / APPLE PAY'}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


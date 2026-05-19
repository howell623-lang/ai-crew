'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Cpu, Globe, Zap, ArrowRight, UserCheck } from 'lucide-react'
import { fetchModels } from '@/lib/models'
import { Model } from './types'

interface TalentPoolProps {
  onSelect: (model: Model) => void
}

export function TalentPool({ onSelect }: TalentPoolProps) {
  const [models, setModels] = useState<Model[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'local' | 'cloud'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    setIsLoading(true)
    try {
      const data = await fetchModels()
      setModels(data)
    } catch (err) {
      console.error('Fetch Models Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredModels = models.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          (m.provider?.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter = filter === 'all' ? true : 
                          filter === 'local' ? m.type === 'local' : 
                          m.type === 'cloud'
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Talent Marketplace</h2>
          <p className="text-zinc-500 text-sm">正在实时监测全网 {models.length} 名 AI 候选工具。</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text"
              placeholder="搜索模型或厂商..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-zinc-600 transition-all w-64"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 focus:outline-none"
          >
            <option value="all">所有部署模式</option>
            <option value="local">本地部署</option>
            <option value="cloud">云端 API</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-zinc-900/40 rounded-[2rem] border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <motion.div
              layout
              key={model.id || model.name}
              className="group relative bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-8 hover:border-zinc-600 transition-all hover:bg-zinc-900/60 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">{model.provider}</div>
                  <h3 className="text-2xl font-black text-zinc-100 group-hover:text-white transition-colors italic uppercase tracking-tight">{model.name}</h3>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-2xl text-zinc-400 group-hover:text-emerald-500 transition-colors">
                  {model.vram > 0 ? <Cpu className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {model.capabilities?.slice(0, 3).map((cap: string) => (
                    <span key={cap} className="px-2 py-0.5 rounded-full bg-zinc-800/50 text-[9px] text-zinc-500 font-bold uppercase border border-zinc-700/50">
                      {cap}
                    </span>
                  ))}
                </div>
                <p className="text-zinc-500 text-xs line-clamp-2 italic">
                  {model.description || '高保真逻辑推理专家，擅长多维任务调度与复杂指令执行。'}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800/50 flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-600 font-mono uppercase">Performance Index</div>
                  <div className="text-2xl font-black text-white italic tracking-tighter">{model.score}</div>
                </div>
                <button 
                  onClick={() => onSelect(model)}
                  className="p-3 bg-white text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
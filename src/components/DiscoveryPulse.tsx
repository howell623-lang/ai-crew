'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, ShieldCheck, Globe, Database } from 'lucide-react'
import { fetchModels } from '@/lib/models'

interface LogEntry {
  id: string
  time: string
  type: 'FIND' | 'VET' | 'POACH' | 'METRIC'
  content: string
}

/**
 * 模拟日志模板
 */
const SAMPLE_LOGS = [
  { type: 'FIND', content: '发现新候选模型: Llama-3.3-70B-Speculative' },
  { type: 'VET', content: '完成 DeepSeek-V3 编程能力指标跑分: 94.2 pts' },
  { type: 'METRIC', content: '监测到 OpenAI API 响应延迟波动: +15ms' },
  { type: 'POACH', content: '成功猎取 Flux.1 [dev] 全量技术参数' },
  { type: 'FIND', content: 'HuggingFace 热度榜更新: Mistral-Large 排名上升' },
  { type: 'VET', content: '对标硬件 RTX 4090 完成本地量化测试 (4-bit)' },
]

export function DiscoveryPulse() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [totalModels, setTotalModels] = useState(0)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // 初始化: 从静态 JSON 获取模型数据
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const models = await fetchModels()
      setTotalModels(models.length)

      // 使用模拟日志
      const initialLogs = generateSimulatedLogs(5)
      setLogs(initialLogs)
    } catch (err) {
      console.error('Fetch initial data error:', err)
      setLogs(generateSimulatedLogs(5))
    }
  }

  // 定时添加模拟日志
  useEffect(() => {
    const addLog = () => {
      const simulated = generateSimulatedLogs(1)
      setLogs(prev => [...prev.slice(-15), ...simulated])
    }

    const interval = setInterval(addLog, 8000)
    return () => clearInterval(interval)
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'FIND': return 'text-blue-400'
      case 'VET': return 'text-emerald-400'
      case 'POACH': return 'text-amber-400'
      case 'METRIC': return 'text-zinc-500'
      default: return 'text-zinc-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FIND': return <Search className="w-3 h-3" />
      case 'VET': return <ShieldCheck className="w-3 h-3" />
      case 'POACH': return <Zap className="w-3 h-3" />
      case 'METRIC': return <Globe className="w-3 h-3" />
      default: return <Database className="w-3 h-3" />
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/80 backdrop-blur-md border-t border-zinc-900 z-40 h-10 overflow-hidden hidden md:block">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center">
        <div className="flex items-center gap-2 mr-6 text-zinc-600 font-mono text-[10px] shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          HUNTER PULSE / LIVE SCAN
        </div>
        
        <div ref={logContainerRef} className="flex-1 overflow-hidden h-full flex items-center">
          <div className="flex gap-8 items-center animate-infinite-scroll">
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-[10px] font-mono whitespace-nowrap"
                >
                  <span className="text-zinc-700">[{log.time}]</span>
                  <span className={getTypeStyle(log.type)}>{getTypeIcon(log.type)}</span>
                  <span className="text-zinc-400 tracking-tighter">{log.content}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="ml-6 flex items-center gap-3 text-[10px] font-mono text-zinc-600 uppercase tracking-tighter shrink-0 border-l border-zinc-800 pl-6">
          <span>Targeting: {totalModels.toLocaleString()} Models</span>
          <span className="text-zinc-800">|</span>
          <span>Scanned: 24/24H</span>
        </div>
      </div>
    </div>
  )
}

/**
 * 生成模拟日志
 */
function generateSimulatedLogs(count: number): LogEntry[] {
  const entries: LogEntry[] = []
  for (let i = 0; i < count; i++) {
    const template = SAMPLE_LOGS[Math.floor(Math.random() * SAMPLE_LOGS.length)]
    entries.push({
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: template.type as any,
      content: template.content,
    })
  }
  return entries
}
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Zap, Box, ArrowRight, ChevronRight, HardDrive, LayoutGrid, Type, Image as ImageIcon, Video, Mic2, Users, Code, PenTool, BrainCircuit } from 'lucide-react'
import { OnboardingData } from './types'

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void
}

const JOB_TASKS = [
  { id: 'text', name: '深度写作', icon: <Type className="w-5 h-5" />, desc: '文案、报告、创意写作' },
  { id: 'code', name: '全栈编程', icon: <Code className="w-5 h-5" />, desc: '代码实现、Debug、架构' },
  { id: 'image', name: '视觉创意', icon: <ImageIcon className="w-5 h-5" />, desc: '平面设计、插画、修图' },
  { id: 'video', name: '动态影像', icon: <Video className="w-5 h-5" />, desc: '视频剪辑、动态生成' },
  { id: 'audio', name: '音频处理', icon: <Mic2 className="w-5 h-5" />, desc: '配音、编曲、降噪' },
  { id: 'agent', name: '自主执行', icon: <BrainCircuit className="w-5 h-5" />, desc: '自动化、复杂流程调度' },
]

const ALL_CANDIDATES = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'midjourney', name: 'Midjourney v6', provider: 'Independent' },
  { id: 'runway-gen3', name: 'Runway Gen-3', provider: 'Runway' },
  { id: 'deepseek-v3', name: 'DeepSeek-V3', provider: 'DeepSeek' },
]

const INDUSTRY_PRESETS = [
  { id: 'dev', name: 'AI 开发者', tasks: ['code', 'text', 'agent'], icon: <Code className="w-3 h-3" /> },
  { id: 'creator', name: '内容创作者', tasks: ['image', 'video', 'audio', 'text'], icon: <ImageIcon className="w-3 h-3" /> },
  { id: 'marketer', name: '营销专家', tasks: ['text', 'image', 'agent'], icon: <Users className="w-3 h-3" /> },
]

const DESK_OPTIONS = [
  { value: 8, label: '8GB 工位', desc: '刚够实习生落脚 (RTX 3060)' },
  { value: 16, label: '16GB 工位', desc: '高级主管级办公桌 (RTX 4080)' },
  { value: 24, label: '24GB 工位', desc: '总裁办独立办公室 (RTX 4090)' },
  { value: 48, label: '48GB+', desc: '企业级研发集群 (M3 Max/A6000)' },
]


export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    tasks: [],
    currentModels: [],
    vram: 0,
  })

  // 切换任务选中状态
  const toggleTask = (taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.includes(taskId) 
        ? prev.tasks.filter(id => id !== taskId) 
        : [...prev.tasks, taskId]
    }))
  }

  // 切换模型选中状态
  const toggleModel = (modelName: string) => {
    setData(prev => ({
      ...prev,
      currentModels: prev.currentModels.includes(modelName)
        ? prev.currentModels.filter(m => m !== modelName)
        : [...prev.currentModels, modelName]
    }))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="w-full max-w-2xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono">
                  CAPABILITY MATRIX / 需求能力矩阵配置
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-white italic">您需要哪方面的 AI 能力支持？</h2>
                <p className="text-zinc-500">点击选择您希望 AI 工具具备的职能（可多选）。</p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {INDUSTRY_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => setData({ ...data, tasks: preset.tasks })}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 hover:border-zinc-500 hover:text-white transition-all uppercase font-bold tracking-tighter"
                    >
                      {preset.icon} {preset.name} (预设)
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {JOB_TASKS.map((task) => {
                  const isSelected = data.tasks.includes(task.id)
                  return (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`group relative flex flex-col p-5 rounded-2xl border transition-all text-left h-full
                        ${isSelected 
                          ? 'bg-white border-white text-black' 
                          : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                    >
                      <div className={`p-2 rounded-lg mb-3 ${isSelected ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                        {task.icon}
                      </div>
                      <div className="font-bold text-base mb-1">{task.name}</div>
                      <div className="text-[10px] opacity-60 leading-tight">{task.desc}</div>
                      {isSelected && (
                        <div className="absolute top-4 right-4 bg-black text-white p-1 rounded-full scale-75">
                          <Zap className="w-3 h-3 fill-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="pt-6 flex justify-center">
                <button
                  disabled={data.tasks.length === 0}
                  onClick={() => setStep(2)}
                  className="px-12 py-4 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed group flex items-center gap-2"
                >
                  确认功能需求 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">您目前在使用的 AI 工具是？</h2>
                <p className="text-zinc-500 text-sm">选择您已经在使用的模型，我们将为您寻找更强力的对标方案。</p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {ALL_CANDIDATES.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => toggleModel(model.name)}
                    className={`px-6 py-3 rounded-xl border font-medium transition-all
                      ${data.currentModels.includes(model.name)
                        ? 'bg-zinc-100 border-white text-black' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-white'
                      }`}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between pt-8">
                <button onClick={() => setStep(1)} className="px-6 py-2 text-zinc-500 hover:text-white">上一步：修定功能需求</button>
                <button
                  disabled={data.currentModels.length === 0}
                  onClick={() => setStep(3)}
                  className="px-10 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
                >
                  下一步
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">您的硬件显存 (VRAM) 环境？</h2>
                <p className="text-zinc-500">
                  针对本地模型部署，显存资源决定了候选模型的可选范围。
                </p>
              </div>

              <div className="space-y-3">
                {DESK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setData({ ...data, vram: opt.value })}
                    className={`group w-full flex items-center p-5 rounded-2xl border transition-all duration-300
                      ${data.vram === opt.value 
                        ? 'bg-white border-white text-black ring-4 ring-white/10' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                  >
                    <div className="text-left">
                      <div className="font-bold text-lg">{opt.label}</div>
                      <div className="text-sm opacity-60">{opt.desc}</div>
                    </div>
                    {data.vram === opt.value && <ArrowRight className="ml-auto w-5 h-5" />}
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="px-6 py-2 text-zinc-500 hover:text-white">上一步</button>
                <button
                  disabled={!data.vram}
                  onClick={() => onComplete(data)}
                  className="px-8 py-3 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  开始全网模型对标
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}




/**
 * AI Crew 数据获取层 - 纯静态 JSON 方案
 * 从 /public/data/models.json 读取模型数据
 */

import type { Model } from '../components/types'

// 确保类型兼容
interface RawModel {
  id: string
  name: string
  provider: string
  type: 'cloud' | 'local'
  category: string
  vram_required: number
  score: number
  capabilities: string[]
  description: string
  parameters: Record<string, string>
}

// 将原始 JSON 数据转换为 Model 类型
function rawToModel(raw: RawModel): Model {
  return {
    ...raw,
    vram: raw.vram_required,
  }
}

let cachedModels: Model[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 分钟缓存

export async function fetchModels(): Promise<Model[]> {
  // 使用缓存（5分钟内不重复请求）
  if (cachedModels && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedModels
  }

  try {
    const response = await fetch('/data/models.json')
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`)
    }
    const rawModels: RawModel[] = await response.json()
    cachedModels = rawModels.map(rawToModel)
    lastFetchTime = Date.now()
    return cachedModels
  } catch (error) {
    console.error('Error fetching models:', error)
    // 如果获取失败，返回缓存数据（如果有）
    if (cachedModels) {
      return cachedModels
    }
    // 首次加载失败，返回空数组
    return []
  }
}

export function getModelById(id: string): Model | undefined {
  return cachedModels?.find(m => m.id === id)
}

export function getModelsByCategory(category: string): Model[] {
  return cachedModels?.filter(m => m.category === category) || []
}

export function getCloudModels(): Model[] {
  return cachedModels?.filter(m => m.type === 'cloud') || []
}

export function getLocalModels(): Model[] {
  return cachedModels?.filter(m => m.type === 'local') || []
}

export function getModelsByVramRange(minVram: number, maxVram: number): Model[] {
  return cachedModels?.filter(m => m.vram >= minVram && m.vram <= maxVram) || []
}

export function getTopModels(count: number = 10): Model[] {
  return [...(cachedModels || [])].sort((a, b) => b.score - a.score).slice(0, count)
}

/**
 * 清除缓存，强制重新获取数据
 */
export function refreshModels(): Promise<Model[]> {
  cachedModels = null
  lastFetchTime = 0
  return fetchModels()
}
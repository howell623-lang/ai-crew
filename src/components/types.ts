/**
 * Model 类型定义
 */
export interface Model {
  id?: string
  name: string
  vram: number
  score: number
  type?: 'cloud' | 'local'
  category?: string
  provider?: string
  description?: string
  capabilities?: string[]
  parameters?: Record<string, string>
}



export interface OnboardingData {
  tasks: string[]
  currentModels: string[]
  vram: number
}



export type ViewMode = 'simple' | 'detailed'
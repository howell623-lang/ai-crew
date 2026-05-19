// Supabase Edge Function: ai-crawler
// 真实爬虫 — 对接 HuggingFace API 获取最新模型数据
// 支持: HF Models API, GitHub Releases, 以及手动维护的候选清单

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("Starting 24h AI Hunting Scan...")

    // ========================================
    // 数据源 1: HuggingFace Models API
    // 获取最近 24h 内更新的热门模型
    // ========================================
    const hfModels = await fetchHuggingFaceModels()
    
    // ========================================
    // 数据源 2: GitHub Releases (针对热门 AI 项目)
    // ========================================
    const githubReleases = await fetchGitHubReleases()
    
    // ========================================
    // 数据源 3: 手动维护的候选清单 (兜底)
    // ========================================
    const manualCandidates = getManualCandidates()

    // 合并所有候选模型 (去重)
    const allCandidates = mergeCandidates(hfModels, githubReleases, manualCandidates)
    
    console.log(`Total candidates to process: ${allCandidates.length}`)

    // ========================================
    // 增量更新到 ai_models 人才库
    // ========================================
    let updatedCount = 0
    const newModels: string[] = []
    
    for (const model of allCandidates) {
      // 检查是否已存在
      const { data: existing } = await supabaseAdmin
        .from('ai_models')
        .select('id')
        .eq('name', model.name)
        .single()

      const upsertData: any = {
        name: model.name,
        provider: model.provider,
        score: model.score,
        type: model.type,
        category: model.category,
        vram_required: model.vram || 0,
        capabilities: model.capabilities || [],
        description: model.description || '',
        parameters: model.parameters || {},
      }

      // 如果有额外字段，也一并更新
      if (model.context_length) upsertData.parameters = { ...upsertData.parameters, context: model.context_length }
      if (model.speed) upsertData.parameters = { ...upsertData.parameters, speed: model.speed }
      if (model.salary) upsertData.parameters = { ...upsertData.parameters, salary: model.salary }

      const { error } = await supabaseAdmin
        .from('ai_models')
        .upsert(upsertData, { onConflict: 'name' })

      if (error) {
        console.error(`Error updating talent ${model.name}:`, error)
      } else {
        updatedCount++
        if (!existing) newModels.push(model.name)
      }
    }

    // ========================================
    // 记录扫描日志到 crawler_logs
    // ========================================
    await supabaseAdmin.from('crawler_logs').insert({
      scan_source: 'AI Hunter Crawler v2',
      found_models: allCandidates.length,
      new_models: newModels.length,
      updated_models: updatedCount,
      details: JSON.stringify({
        hf_count: hfModels.length,
        github_count: githubReleases.length,
        manual_count: manualCandidates.length,
        new_model_names: newModels,
      }),
      status: 'success'
    })

    console.log(`Scan completed. Updated ${updatedCount} models, ${newModels.length} new.`)

    return new Response(JSON.stringify({ 
      message: 'Scan completed successfully',
      stats: {
        total_candidates: allCandidates.length,
        updated: updatedCount,
        new: newModels.length,
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Crawler error:', err)
    
    // 即使出错也记录日志
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      await supabaseAdmin.from('crawler_logs').insert({
        scan_source: 'AI Hunter Crawler v2',
        status: 'error',
        details: JSON.stringify({ error: err.message })
      })
    } catch {}

    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

// ========================================
// HuggingFace API 爬虫
// ========================================
async function fetchHuggingFaceModels(): Promise<any[]> {
  const models: any[] = []
  
  try {
    // 获取最近更新的 LLM 模型 (按 likes 排序)
    const response = await fetch(
      'https://huggingface.co/api/models?limit=20&sort=likes&direction=-1&pipeline_tag=text-generation',
      { headers: { 'Accept': 'application/json' } }
    )
    
    if (!response.ok) throw new Error(`HF API ${response.status}`)
    
    const hfData: any[] = await response.json()
    
    for (const m of hfData) {
      // 提取关键信息
      const modelName = m.id.split('/').pop() || m.id
      const likes = m.likes || 0
      
      // 评分算法: 基于 likes 和 downloads 计算
      const score = Math.min(99, Math.round(70 + (Math.log10(likes) * 3) + (Math.log10(m.downloads || 1) * 2)))
      
      // 判断是否需要本地部署 (根据大小估算 VRAM)
      const safetensors = m.safetensors || {}
      const totalSize = Object.values(safetensors).reduce((sum: number, v: any) => sum + (v.size || 0), 0)
      const vram = totalSize > 0 ? Math.ceil(totalSize / (1024 * 1024 * 1024)) : 0
      
      // 能力标签推断
      const capabilities = inferCapabilities(m)
      
      // 分类判断
      let category = 'llm'
      if (m.pipeline_tag?.includes('image')) category = 'image'
      else if (m.pipeline_tag?.includes('video')) category = 'video'
      else if (m.pipeline_tag?.includes('audio')) category = 'audio'
      
      models.push({
        name: modelName,
        provider: m.author || 'HuggingFace',
        score,
        type: vram > 0 ? 'local' : 'cloud',
        category,
        vram: vram > 0 ? vram : 0,
        capabilities,
        description: m.cardData?.summary || m.description?.substring(0, 100) || '',
        parameters: {
          downloads: m.downloads || '---',
          likes: likes,
          speed: estimateSpeed(vram),
        }
      })
    }
  } catch (err) {
    console.error('HuggingFace fetch error:', err)
  }
  
  return models
}

// ========================================
// GitHub Releases 爬虫
// ========================================
async function fetchGitHubReleases(): Promise<any[]> {
  const models: any[] = []
  
  // 关注的 AI 项目列表
  const repos = [
    'meta-llama/llama3', 
    'huggingface/transformers',
    'mlabonne/llama-cpp-python',
    'Comfy-Org/ComfyUI',
  ]
  
  try {
    for (const repo of repos) {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/releases?per_page=3`,
        { headers: { 'Accept': 'application/vnd.github.v3+json' } }
      )
      
      if (!response.ok) continue
      
      const releases: any[] = await response.json()
      
      for (const release of releases) {
        // 从 release notes 中提取模型相关信息
        const tagName = release.tag_name || ''
        const body = release.body || ''
        
        // 简单的启发式: 如果 release notes 提到模型相关关键词，则记录
        if (tagName.match(/llama|llm|model|vision/i)) {
          models.push({
            name: `${repo.split('/')[0]}-${tagName}`,
            provider: repo.split('/')[0],
            score: 85,
            type: 'local',
            category: 'llm',
            vram: 24,
            capabilities: ['text', 'code'],
            description: body.substring(0, 100),
            parameters: { source: 'GitHub', version: tagName }
          })
        }
      }
    }
  } catch (err) {
    console.error('GitHub fetch error:', err)
  }
  
  return models
}

// ========================================
// 手动维护的候选清单 (兜底数据源)
// ========================================
function getManualCandidates(): any[] {
  return [
    { 
      name: 'GPT-4o', 
      provider: 'OpenAI', 
      score: 96, 
      type: 'cloud', 
      category: 'llm',
      capabilities: ['text', 'code', 'image'],
      description: '全能多模态专家，支持文本、代码、图像理解与生成',
      parameters: { salary: '$15.00', speed: '80 tokens/s', specialty: '全能多模态专家', roi: '中' }
    },
    { 
      name: 'Claude 3.5 Sonnet', 
      provider: 'Anthropic', 
      score: 97, 
      type: 'cloud', 
      category: 'llm',
      capabilities: ['text', 'code'],
      description: '深度写作与逻辑大师，编程能力顶尖',
      parameters: { salary: '$3.00', speed: '100 tokens/s', specialty: '深度写作与逻辑大师', roi: '高' }
    },
    { 
      name: 'DeepSeek-V3', 
      provider: 'DeepSeek', 
      score: 97, 
      type: 'local', 
      category: 'llm',
      vram: 48,
      capabilities: ['text', 'code', 'logic'],
      description: '极速工程与逻辑推理专家，支持本地部署',
      parameters: { salary: '$0.15', speed: '150 tokens/s', specialty: '极速工程与逻辑推理', roi: '高' }
    },
    { 
      name: 'Flux.1 [dev]', 
      provider: 'Black Forest', 
      score: 96, 
      type: 'local', 
      category: 'image',
      vram: 24,
      capabilities: ['image', 'design'],
      description: '私密性极佳的本地生图助理',
      parameters: { salary: '$0.00 (Local)', speed: '45 tokens/s', specialty: '私密性极佳的设计助理', roi: '极高' }
    },
    { 
      name: 'Kling AI', 
      provider: 'Kuaishou', 
      score: 96, 
      type: 'cloud', 
      category: 'video',
      capabilities: ['video', 'animation'],
      description: '动态视觉生成专家',
      parameters: { salary: '按需计费', speed: '中等', specialty: '动态视觉生成专家', roi: '高' }
    },
    { 
      name: 'Gemini 1.5 Pro', 
      provider: 'Google', 
      score: 96, 
      type: 'cloud', 
      category: 'llm',
      capabilities: ['text', 'code', 'video', 'audio'],
      description: '原生多模态之王，支持超长上下文与视频理解',
      parameters: { salary: '$7.00', speed: '90 tokens/s', specialty: '超长上下文多模态', roi: '高' }
    },
  ]
}

// ========================================
// 辅助函数
// ========================================
function inferCapabilities(m: any): string[] {
  const caps: string[] = []
  const tags = m.tags || []
  const pipeline = m.pipeline_tag || ''
  
  if (pipeline.includes('text-generation') || tags.includes('text-generation')) caps.push('text')
  if (tags.includes('code') || pipeline.includes('code')) caps.push('code')
  if (pipeline.includes('image') || tags.includes('image')) caps.push('image')
  if (pipeline.includes('video') || tags.includes('video')) caps.push('video')
  if (pipeline.includes('audio') || tags.includes('audio')) caps.push('audio')
  if (tags.includes('agent') || m.cardData?.library_name === 'langchain') caps.push('agent')
  
  return caps.length > 0 ? caps : ['text']
}

function estimateSpeed(vram: number): string {
  if (vram === 0) return 'API Dependent'
  if (vram <= 8) return '15 tokens/s'
  if (vram <= 16) return '30 tokens/s'
  if (vram <= 24) return '60 tokens/s'
  return '120+ tokens/s'
}

function mergeCandidates(...sources: any[][]): any[] {
  const map = new Map<string, any>()
  for (const source of sources) {
    for (const model of source) {
      if (!map.has(model.name)) {
        map.set(model.name, model)
      }
    }
  }
  return Array.from(map.values())
}
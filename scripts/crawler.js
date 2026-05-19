/**
 * AI Crew Crawler - 纯静态爬虫脚本
 * 从多个数据源获取最新模型信息，更新 public/data/models.json
 * 
 * 运行方式: node scripts/crawler.js
 */

const fs = require('fs');
const path = require('path');

const MODELS_FILE = path.join(__dirname, '..', 'public', 'data', 'models.json');

/**
 * 从 HuggingFace API 获取热门模型
 */
async function fetchHuggingFaceModels() {
  const models = [];
  
  try {
    const response = await fetch(
      'https://huggingface.co/api/models?limit=20&sort=likes&direction=-1&pipeline_tag=text-generation',
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) throw new Error(`HF API ${response.status}`);
    
    const hfData = await response.json();
    
    for (const m of hfData) {
      const modelName = m.id.split('/').pop() || m.id;
      const likes = m.likes || 0;
      const score = Math.min(99, Math.round(70 + (Math.log10(likes) * 3) + (Math.log10(m.downloads || 1) * 2)));
      
      const capabilities = inferCapabilities(m);
      let category = 'llm';
      if (m.pipeline_tag?.includes('image')) category = 'image';
      else if (m.pipeline_tag?.includes('video')) category = 'video';
      else if (m.pipeline_tag?.includes('audio')) category = 'audio';

      models.push({
        name: modelName,
        provider: m.author || 'HuggingFace',
        score,
        type: vram > 0 ? 'local' : 'cloud',
        category,
        vram_required: 0,
        capabilities,
        description: m.cardData?.summary || m.description?.substring(0, 100) || '',
        parameters: {
          downloads: String(m.downloads || '---'),
          likes: String(likes),
          speed: estimateSpeed(0),
        }
      });
    }
  } catch (err) {
    console.error('HuggingFace fetch error:', err);
  }
  
  return models;
}

/**
 * 手动维护的候选清单（兜底数据源）
 */
function getManualCandidates() {
  return [
    { 
      id: '1',
      name: 'GPT-4o', 
      provider: 'OpenAI', 
      score: 96, 
      type: 'cloud', 
      category: 'llm',
      vram_required: 0,
      capabilities: ['text', 'code', 'image'],
      description: '全能多模态专家，支持文本、代码、图像理解与生成',
      parameters: {
        salary: '$15.00/1M tokens',
        speed: '80 tokens/s',
        specialty: '全能多模态专家',
        roi: '中',
        context: '128K'
      }
    },
    { 
      id: '2',
      name: 'Claude 3.5 Sonnet', 
      provider: 'Anthropic', 
      score: 97, 
      type: 'cloud', 
      category: 'llm',
      vram_required: 0,
      capabilities: ['text', 'code'],
      description: '深度写作与逻辑大师，编程能力顶尖',
      parameters: {
        salary: '$3.00/1M tokens',
        speed: '100 tokens/s',
        specialty: '深度写作与逻辑大师',
        roi: '高',
        context: '200K'
      }
    },
    { 
      id: '3',
      name: 'Gemini 1.5 Pro', 
      provider: 'Google', 
      score: 96, 
      type: 'cloud', 
      category: 'llm',
      vram_required: 0,
      capabilities: ['text', 'code', 'video', 'audio'],
      description: '原生多模态之王，支持超长上下文与视频理解',
      parameters: {
        salary: '$7.00/1M tokens',
        speed: '90 tokens/s',
        specialty: '超长上下文多模态',
        roi: '高',
        context: '2M'
      }
    },
    { 
      id: '4',
      name: 'Kling AI', 
      provider: 'Kuaishou', 
      score: 96, 
      type: 'cloud', 
      category: 'video',
      vram_required: 0,
      capabilities: ['video', 'animation'],
      description: '动态视觉生成专家',
      parameters: {
        salary: '按需计费',
        speed: '中等',
        specialty: '动态视觉生成专家',
        roi: '高'
      }
    },
    { 
      id: '5',
      name: 'Llama 3 70B (4-bit)', 
      provider: 'Meta', 
      score: 91, 
      type: 'local', 
      category: 'llm',
      vram_required: 16,
      capabilities: ['text', 'code'],
      description: '开源标杆，性能直逼 GPT-4',
      parameters: {
        salary: '$0.00 (Local)',
        speed: '30 tokens/s',
        specialty: '开源全能选手',
        roi: '极高',
        context: '8K'
      }
    },
    { 
      id: '6',
      name: 'DeepSeek-V3', 
      provider: 'DeepSeek', 
      score: 97, 
      type: 'local', 
      category: 'llm',
      vram_required: 48,
      capabilities: ['text', 'code', 'logic'],
      description: '极速工程与逻辑推理专家，支持本地部署',
      parameters: {
        salary: '$0.15/1M tokens',
        speed: '150 tokens/s',
        specialty: '极速工程与逻辑推理',
        roi: '高',
        context: '32K'
      }
    },
    { 
      id: '7',
      name: 'Llama 3 8B', 
      provider: 'Meta', 
      score: 82, 
      type: 'local', 
      category: 'llm',
      vram_required: 6,
      capabilities: ['text'],
      description: '入门级本地模型，速度极快',
      parameters: {
        salary: '$0.00 (Local)',
        speed: '15 tokens/s',
        specialty: '轻量级快速推理',
        roi: '极高',
        context: '8K'
      }
    },
    { 
      id: '8',
      name: 'Flux.1 [dev]', 
      provider: 'Black Forest Labs', 
      score: 96, 
      type: 'local', 
      category: 'image',
      vram_required: 24,
      capabilities: ['image', 'design'],
      description: '私密性极佳的本地生图助理',
      parameters: {
        salary: '$0.00 (Local)',
        speed: '45 tokens/s',
        specialty: '私密性极佳的设计助理',
        roi: '极高'
      }
    },
    { 
      id: '9',
      name: 'Mistral 7B Instruct', 
      provider: 'Mistral AI', 
      score: 84, 
      type: 'local', 
      category: 'llm',
      vram_required: 8,
      capabilities: ['text', 'code'],
      description: '高效轻量级本地推理模型',
      parameters: {
        salary: '$0.00 (Local)',
        speed: '20 tokens/s',
        specialty: '轻量级高效推理',
        roi: '极高',
        context: '32K'
      }
    },
    { 
      id: '10',
      name: 'Qwen2.5 72B', 
      provider: 'Alibaba', 
      score: 93, 
      type: 'local', 
      category: 'llm',
      vram_required: 24,
      capabilities: ['text', 'code', 'logic'],
      description: '国产大模型，多语言能力强',
      parameters: {
        salary: '$0.00 (Local)',
        speed: '40 tokens/s',
        specialty: '多语言全能选手',
        roi: '极高',
        context: '128K'
      }
    },
  ];
}

/**
 * 推断能力标签
 */
function inferCapabilities(m) {
  const caps = [];
  const tags = m.tags || [];
  const pipeline = m.pipeline_tag || '';
  
  if (pipeline.includes('text-generation') || tags.includes('text-generation')) caps.push('text');
  if (tags.includes('code') || pipeline.includes('code')) caps.push('code');
  if (pipeline.includes('image') || tags.includes('image')) caps.push('image');
  if (pipeline.includes('video') || tags.includes('video')) caps.push('video');
  if (pipeline.includes('audio') || tags.includes('audio')) caps.push('audio');
  if (tags.includes('agent') || m.cardData?.library_name === 'langchain') caps.push('agent');
  
  return caps.length > 0 ? caps : ['text'];
}

/**
 * 估算速度
 */
function estimateSpeed(vram) {
  if (vram === 0) return 'API Dependent';
  if (vram <= 8) return '15 tokens/s';
  if (vram <= 16) return '30 tokens/s';
  if (vram <= 24) return '60 tokens/s';
  return '120+ tokens/s';
}

/**
 * 合并候选模型（去重）
 */
function mergeCandidates(...sources) {
  const map = new Map();
  for (const source of sources) {
    for (const model of source) {
      if (!map.has(model.name)) {
        map.set(model.name, model);
      }
    }
  }
  return Array.from(map.values());
}

/**
 * 主函数
 */
async function main() {
  console.log('🤖 AI Crew Crawler v1.0 - Starting scan...');
  
  // 读取现有数据（保留手动维护的模型）
  let existingModels = [];
  try {
    if (fs.existsSync(MODELS_FILE)) {
      existingModels = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8'));
    }
  } catch (err) {
    console.log('No existing models file found, starting fresh.');
  }

  // 获取手动维护的候选清单（作为基础数据）
  const manualCandidates = getManualCandidates();
  
  // 尝试从 HuggingFace 获取新模型
  console.log('Fetching from HuggingFace...');
  const hfModels = await fetchHuggingFaceModels();
  console.log(`Found ${hfModels.length} models from HuggingFace`);

  // 合并所有模型（手动维护的优先）
  const allModels = mergeCandidates(manualCandidates, hfModels);
  
  console.log(`Total models after merge: ${allModels.length}`);
  console.log(`New models from HF: ${hfModels.length}`);

  // 写入 JSON 文件
  fs.writeFileSync(MODELS_FILE, JSON.stringify(allModels, null, 2));
  console.log(`✅ Models written to ${MODELS_FILE}`);
}

main().catch(err => {
  console.error('Crawler failed:', err);
  process.exit(1);
});
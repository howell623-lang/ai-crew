-- 升级 AI 猎头人才库 Schema (支持多次重复运行 - UPSERT 模式)

-- 1. 为 ai_models 增加 category 字段
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'llm';

-- 2. 注入“顶级候选人”数据

-- 大模型部 (LLM)
INSERT INTO ai_models (name, provider, vram_required, score, type, category) VALUES
('DeepSeek-V3', 'DeepSeek', 48, 97, 'local', 'llm'),
('Llama-3.1-405B', 'Meta', 80, 98, 'local', 'llm'),
('Qwen-2.5-72B', 'Alibaba', 40, 95, 'local', 'llm')
ON CONFLICT (name) DO UPDATE SET 
    provider = EXCLUDED.provider,
    vram_required = EXCLUDED.vram_required,
    score = EXCLUDED.score,
    type = EXCLUDED.type,
    category = EXCLUDED.category;

-- 生图部 (Image)
INSERT INTO ai_models (name, provider, vram_required, score, type, category) VALUES
('Flux.1 [dev]', 'Black Forest', 24, 96, 'local', 'image'),
('Stable Diffusion 3.5', 'Stability AI', 16, 92, 'local', 'image'),
('Midjourney v6.1', 'Midjourney', 0, 98, 'cloud', 'image')
ON CONFLICT (name) DO UPDATE SET 
    category = EXCLUDED.category,
    score = EXCLUDED.score;

-- 视频部 (Video)
INSERT INTO ai_models (name, provider, vram_required, score, type, category) VALUES
('Kling AI', 'Kuaishou', 0, 96, 'cloud', 'video'),
('Luma Dream Machine', 'Luma AI', 0, 94, 'cloud', 'video'),
('SVD (Stable Video Diffusion)', 'Stability AI', 24, 88, 'local', 'video')
ON CONFLICT (name) DO UPDATE SET 
    category = EXCLUDED.category;

-- 3. 索引优化
CREATE INDEX IF NOT EXISTS idx_models_category ON ai_models(category);

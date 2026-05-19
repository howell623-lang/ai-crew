-- AI Hunter 2.0: 任务能力矩阵升级

-- 1. 为 ai_models 增加 capabilities (任务标签) 字段
ALTER TABLE ai_models ADD COLUMN IF NOT EXISTS capabilities TEXT[] DEFAULT '{}';

-- 2. 注入具备“多面手”能力的候选人数据 (UPSERT 模式)

-- 更新现有模型的能力标签
UPDATE ai_models SET capabilities = '{text, code, logic}' WHERE name = 'DeepSeek-V3';
UPDATE ai_models SET capabilities = '{text, code, image}' WHERE name = 'GPT-4o';
UPDATE ai_models SET capabilities = '{text, code}' WHERE name = 'Claude 3.5 Sonnet';
UPDATE ai_models SET capabilities = '{image, design}' WHERE name = 'Flux.1 [dev]';
UPDATE ai_models SET capabilities = '{video, animation}' WHERE name = 'Kling AI';

-- 注入新的“全能员工”数据
INSERT INTO ai_models (name, provider, vram_required, score, type, category, capabilities, description) VALUES
('Gemini 1.5 Pro', 'Google', 0, 96, 'cloud', 'llm', '{text, code, video, audio}', '原生多模态之王，支持超长上下文与视频理解'),
('Llama 3.2 Vision', 'Meta', 12, 88, 'local', 'llm', '{text, image}', '具备视觉理解能力的本地模型'),
('DeepSeek-Janus', 'DeepSeek', 16, 90, 'local', 'llm', '{text, image}', '不但能理解图片，还能精准生成图片的本地全能模型')
ON CONFLICT (name) DO UPDATE SET 
    capabilities = EXCLUDED.capabilities,
    description = EXCLUDED.description;

-- 3. 创建 GIN 索引以加速标签检索
CREATE INDEX IF NOT EXISTS idx_models_capabilities ON ai_models USING GIN (capabilities);

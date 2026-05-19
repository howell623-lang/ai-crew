-- AI Hunter Supabase Schema

-- 1. AI Models Table
-- 存储市面上主流的云端模型和本地模型数据
CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL, -- e.g., 'OpenAI', 'Anthropic', 'Meta', 'Mistral'
    type TEXT NOT NULL CHECK (type IN ('cloud', 'local')),
    vram_required INTEGER DEFAULT 0, -- 单位: GB, 仅对 local 模型有效
    score FLOAT DEFAULT 0, -- 综合评估分 (0-100)
    parameters JSONB DEFAULT '{}'::jsonb, -- 存储上下文长度、发布日期等
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table
-- 存储用户的显存配置和模型选择偏好
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    current_model_id UUID REFERENCES ai_models(id),
    hardware_vram INTEGER DEFAULT 0, -- 用户拥有的显存
    settings JSONB DEFAULT '{}'::jsonb, -- 存储暗色模式、偏好语言等
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Battle Logs (Optional)
-- 记录每一次比对，用于分析热门趋势
CREATE TABLE battle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    old_model_id UUID REFERENCES ai_models(id),
    new_model_id UUID REFERENCES ai_models(id),
    improvement_pct FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入一些初始数据 (种子数据)
INSERT INTO ai_models (name, provider, type, vram_required, score, description) VALUES
('GPT-4o', 'OpenAI', 'cloud', 0, 96, '目前全球最强的多模态云端模型之一'),
('Claude 3.5 Sonnet', 'Anthropic', 'cloud', 0, 95, '编程与逻辑推理的王者'),
('Llama 3 70B (4-bit)', 'Meta', 'local', 16, 91, '开源标杆，性能直逼 GPT-4'),
('DeepSeek-V3', 'DeepSeek', 'local', 24, 94, '国产之光，极高的逻辑与工程能力'),
('Llama 3 8B', 'Meta', 'local', 6, 82, '入门级本地模型，速度极快');

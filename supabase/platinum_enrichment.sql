-- AI Hunter Platinum: 人才背调数据丰富化 (Salary & Speed)

-- 更新模型详细情报 (Salary per 1M tokens, Speed in TPS/PPS, Specialty)
-- 注: JSONB 字段 parameters 用于存储这些多维情报

UPDATE ai_models SET parameters = jsonb_build_object(
    'salary', '$0.15', 
    'speed', '150 tokens/s', 
    'specialty', '极速工程与逻辑推理',
    'roi', '高'
) WHERE name = 'DeepSeek-V3';

UPDATE ai_models SET parameters = jsonb_build_object(
    'salary', '$15.00', 
    'speed', '80 tokens/s', 
    'specialty', '全能多模态专家',
    'roi', '中'
) WHERE name = 'GPT-4o';

UPDATE ai_models SET parameters = jsonb_build_object(
    'salary', '$3.00', 
    'speed', '100 tokens/s', 
    'specialty', '深度写作与逻辑大师',
    'roi', '高'
) WHERE name = 'Claude 3.5 Sonnet';

UPDATE ai_models SET parameters = jsonb_build_object(
    'salary', '$0.00 (Local)', 
    'speed', '45 tokens/s', 
    'specialty', '私密性极佳的设计助理',
    'roi', '极高'
) WHERE name = 'Flux.1 [dev]';

UPDATE ai_models SET parameters = jsonb_build_object(
    'salary', '按需计费', 
    'speed', '中等', 
    'specialty', '动态视觉生成专家',
    'roi', '高'
) WHERE name = 'Kling AI';

UPDATE ai_models SET parameters = jsonb_build_object(
    'salary', '$0.00 (Local)', 
    'speed', '60 tokens/s', 
    'specialty', '即插即用的视觉理解助理',
    'roi', '高'
) WHERE name = 'Llama 3.2 Vision';

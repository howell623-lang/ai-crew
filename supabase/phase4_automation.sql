-- Phase 4: Automation Infrastructure

-- 1. 创建扫描日志表
CREATE TABLE crawler_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_source TEXT NOT NULL, -- e.g., 'GitHub', 'HuggingFace'
    found_models INTEGER DEFAULT 0, -- 发现的高价值模型数量
    status TEXT DEFAULT 'success', -- 'success', 'failed'
    raw_data JSONB, -- 存储原始扫描元数据
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用 pg_net 扩展 (用于 Edge Functions 之间的通信)
-- 这一步通常在 Supabase 控制台的 Extension 页面手动开启即可
-- CREATE EXTENSION IF NOT EXISTS pg_net;

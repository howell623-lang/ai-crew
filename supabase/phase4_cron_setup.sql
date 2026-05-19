-- AI Hunter Phase 4: 自动化爬虫定时触发配置
-- 此脚本在 Supabase SQL Editor 中执行

-- ========================================
-- 1. 创建 crawler_logs 表 (如果不存在)
-- ========================================
CREATE TABLE IF NOT EXISTS crawler_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_source TEXT NOT NULL DEFAULT 'AI Hunter Crawler',
    found_models INTEGER DEFAULT 0,
    new_models INTEGER DEFAULT 0,
    updated_models INTEGER DEFAULT 0,
    details JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 created_at 创建索引以加速最近日志查询
CREATE INDEX IF NOT EXISTS idx_crawler_logs_created_at ON crawler_logs(created_at DESC);

-- ========================================
-- 2. 设置定时任务 (每 6 小时执行一次爬虫)
-- ========================================
-- 使用 pg_cron 扩展 (Supabase Pro 版支持)
-- 如果当前数据库不支持 pg_cron，请跳过此部分
-- 改为通过外部服务 (如 Vercel Cron Job / GitHub Actions) 触发 Edge Function

DO $$
BEGIN
    -- 检查 pg_cron 扩展是否存在
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        -- 删除已存在的定时任务 (避免重复)
        BEGIN
            PERFORM cron.unschedule('ai-hunter-crawler');
        EXCEPTION WHEN OTHERS THEN
            -- 如果任务不存在则忽略错误
            NULL;
        END;

        -- 创建新的定时任务: 每 6 小时执行一次
        -- 通过调用 Edge Function 的 URL 来触发爬虫
        PERFORM cron.schedule(
            'ai-hunter-crawler',
            '0 */6 * * *',  -- 每 6 小时的整点执行 (0:00, 6:00, 12:00, 18:00)
            $$
            -- 注意: 这里需要替换为你的实际 Edge Function URL
            -- 格式: https://<project-ref>.supabase.co/functions/v1/ai-crawler
            INSERT INTO crawler_logs (scan_source, status, details)
            VALUES ('Scheduled Cron', 'running', '{"trigger": "pg_cron"}'::jsonb);
            $$
        );

        RAISE NOTICE 'pg_cron scheduled: ai-hunter-crawler runs every 6 hours';
    ELSE
        RAISE NOTICE 'pg_cron extension not available. Use external cron service instead.';
    END IF;
END $$;

-- ========================================
-- 3. (备选方案) 如果使用外部 Cron 服务
-- ========================================
-- Supabase 不支持 pg_cron 时，推荐使用以下方式之一:
--
-- 方案 A: Vercel Cron Job
--   1. 在 Vercel Dashboard 创建 Cron Job
--   2. 设置调度: 每 6 小时 (0 */6 * * *)
--   3. 发送 GET 请求到: https://<project-ref>.supabase.co/functions/v1/ai-crawler
--   4. Header: Authorization: Bearer <your-service-key>
--
-- 方案 B: GitHub Actions Workflow
--   1. 创建 .github/workflows/crawler-schedule.yml
--   2. 使用 cron 触发器每 6 小时执行
--   3. 发送 curl 请求到 Edge Function URL
--
-- 方案 C: 使用 ngrok + cron-job.org
--   1. 通过 ngrok 暴露本地服务
--   2. 在 cron-job.org 设置定时任务

-- ========================================
-- 4. 验证查询
-- ========================================
-- 查看最近的爬虫日志
-- SELECT * FROM crawler_logs ORDER BY created_at DESC LIMIT 10;

-- 查看爬虫统计
-- SELECT 
--     DATE(created_at) as scan_date,
--     COUNT(*) as scans,
--     SUM(found_models) as total_found,
--     SUM(new_models) as total_new,
--     SUM(updated_models) as total_updated
-- FROM crawler_logs 
-- WHERE status = 'success'
-- GROUP BY DATE(created_at) 
-- ORDER BY scan_date DESC;

-- ========================================
-- 使用说明
-- ========================================
-- 1. 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- 2. 确保 ai-crawler Edge Function 已部署
-- 3. 配置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量
-- 4. 选择 pg_cron 或外部 Cron 服务作为触发方式
-- 5. 通过 DiscoveryPulse 组件查看实时扫描动态
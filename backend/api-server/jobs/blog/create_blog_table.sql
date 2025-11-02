-- 블로그 포스트 테이블 생성
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    plcy_no TEXT UNIQUE NOT NULL REFERENCES policy_clean(plcy_no),
    
    -- LLM 생성 콘텐츠
    blog_title TEXT NOT NULL,
    blog_summary TEXT NOT NULL,
    blog_content TEXT NOT NULL,
    
    -- 메타 정보
    category TEXT,
    region TEXT,
    keywords TEXT[],
    
    -- 생성 정보
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    generation_status TEXT DEFAULT 'completed',
    error_message TEXT
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_blog_posts_plcy_no ON blog_posts(plcy_no);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_region ON blog_posts(region);
CREATE INDEX IF NOT EXISTS idx_blog_posts_generated_at ON blog_posts(generated_at DESC);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();


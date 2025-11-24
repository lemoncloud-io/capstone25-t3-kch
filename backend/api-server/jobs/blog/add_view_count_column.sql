-- blog_posts 테이블에 view_count 컬럼 추가
-- 이미 존재하면 에러 없이 스킵됨

-- 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' AND column_name = 'view_count'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN view_count INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- 인덱스 추가 (조회수 정렬 성능 향상)
CREATE INDEX IF NOT EXISTS idx_blog_posts_view_count ON blog_posts(view_count DESC);


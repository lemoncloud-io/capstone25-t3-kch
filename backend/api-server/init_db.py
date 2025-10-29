"""
Database initialization script for blog posts table.
Run this once to set up the database schema.
"""
from sqlalchemy import text
from database import engine


def init_blog_posts_table():
    """Create blog_posts table with indexes and constraints"""
    with engine.begin() as conn:
        # Create table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS blog_posts (
              id SERIAL PRIMARY KEY,
              slug TEXT UNIQUE NOT NULL,
              plcy_no TEXT,
              title TEXT NOT NULL,
              summary TEXT NOT NULL,
              content TEXT NOT NULL,
              category TEXT NOT NULL,
              thumbnail TEXT,
              author TEXT DEFAULT 'Admin',
              view_count INTEGER DEFAULT 0,
              is_published BOOLEAN DEFAULT false,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW(),
              published_at TIMESTAMPTZ
            )
        """))

        # Create indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_blog_posts_plcy_no ON blog_posts(plcy_no) WHERE plcy_no IS NOT NULL"))

        # Add foreign key constraint if not exists
        fk_exists = conn.execute(text("""
            SELECT 1 FROM pg_constraint
            WHERE conname = 'fk_blog_posts_plcy_no'
        """)).first()

        if not fk_exists:
            try:
                conn.execute(text("""
                    ALTER TABLE blog_posts
                    ADD CONSTRAINT fk_blog_posts_plcy_no
                    FOREIGN KEY (plcy_no) REFERENCES policy_clean(plcy_no)
                    ON DELETE SET NULL
                """))
            except Exception as e:
                # Log but don't fail if constraint can't be added (e.g., policy_clean table doesn't exist yet)
                print(f"Warning: Could not add foreign key constraint: {e}")

        print("✅ Blog posts table initialized successfully")


if __name__ == "__main__":
    init_blog_posts_table()

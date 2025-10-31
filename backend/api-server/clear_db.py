"""
Clear all data from blog_posts table.
Run this to reset the database before creating test data via API.
"""
from sqlalchemy import text
from database import engine


def clear_blog_posts():
    """Delete all posts from blog_posts table"""
    with engine.begin() as conn:
        result = conn.execute(text("DELETE FROM blog_posts"))
        print(f"✅ Deleted {result.rowcount} posts from blog_posts table")


if __name__ == "__main__":
    clear_blog_posts()

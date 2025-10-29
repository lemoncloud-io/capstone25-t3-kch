#!/usr/bin/env python3
"""
Create test posts with various categories and publication statuses
Includes tests for policy linking validation
"""
import requests
import json
import sys

API_URL = "http://localhost:8000/api"

def test_policy_linking():
    """Test creating posts with policy links and validation"""
    print("\n=== Testing Policy Linking ===")

    # Test 1: Get a valid policy
    print("\n1. Fetching valid policies...")
    try:
        response = requests.get(f"{API_URL}/policies", params={"limit": 5})
        if response.status_code != 200:
            print(f"⚠️  Could not fetch policies: {response.status_code}")
            return False

        policies = response.json()
        if not policies:
            print("⚠️  No policies found in database")
            return False

        valid_policy = policies[0]
        print(f"✓ Found policy: {valid_policy['plcy_no']} - {valid_policy.get('title', 'N/A')}")
    except Exception as e:
        print(f"⚠️  Error fetching policies: {e}")
        return False

    # Test 2: Create post with valid plcy_no
    print("\n2. Creating post with valid plcy_no...")
    try:
        post_data = {
            "title": f"정책 연동 테스트: {valid_policy.get('title', 'Policy')[:30]}",
            "summary": "정책과 블로그 포스트 연동 테스트",
            "content": f"# 정책 정보\n\n정책번호: {valid_policy['plcy_no']}\n\n이 포스트는 정책과 연동되어 있습니다.",
            "category": "정책",
            "plcy_no": valid_policy['plcy_no']
        }

        response = requests.post(f"{API_URL}/posts", json=post_data)
        if response.status_code != 200:
            print(f"✗ Failed to create post: {response.status_code} - {response.text}")
            return False

        created_post = response.json()
        assert created_post['plcy_no'] == valid_policy['plcy_no'], "plcy_no mismatch"
        print(f"✓ Created post with plcy_no: {created_post['slug']}")
        test_slug = created_post['slug']
    except Exception as e:
        print(f"✗ Error creating post: {e}")
        return False

    # Test 3: Attempt to create post with INVALID plcy_no (should fail)
    print("\n3. Testing invalid plcy_no (should fail with 400)...")
    try:
        invalid_post = {
            "title": "Invalid Policy Link Test",
            "summary": "This should fail",
            "content": "Testing invalid policy reference",
            "category": "테스트",
            "plcy_no": "INVALID_POLICY_12345"
        }

        response = requests.post(f"{API_URL}/posts", json=invalid_post)
        if response.status_code == 400:
            print(f"✓ Correctly rejected invalid plcy_no: {response.json().get('detail')}")
        else:
            print(f"✗ Should have rejected invalid plcy_no but got: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error testing invalid plcy_no: {e}")
        return False

    # Test 4: Update post plcy_no
    print("\n4. Testing plcy_no update...")
    try:
        # Try to update to another valid policy (if available)
        if len(policies) > 1:
            new_policy = policies[1]
            update_data = {"plcy_no": new_policy['plcy_no']}

            response = requests.put(f"{API_URL}/posts/{test_slug}", json=update_data)
            if response.status_code != 200:
                print(f"✗ Failed to update plcy_no: {response.status_code} - {response.text}")
                return False

            updated_post = response.json()
            assert updated_post['plcy_no'] == new_policy['plcy_no'], "plcy_no not updated"
            print(f"✓ Successfully updated plcy_no to: {new_policy['plcy_no']}")
        else:
            print("⚠️  Only one policy available, skipping update test")
    except Exception as e:
        print(f"✗ Error updating plcy_no: {e}")
        return False

    # Test 5: Unlink policy (set to None)
    print("\n5. Testing policy unlinking...")
    try:
        response = requests.put(f"{API_URL}/posts/{test_slug}", json={"plcy_no": ""})
        if response.status_code != 200:
            print(f"✗ Failed to unlink policy: {response.status_code} - {response.text}")
            return False

        updated_post = response.json()
        assert updated_post['plcy_no'] is None, "plcy_no should be None"
        print(f"✓ Successfully unlinked policy")
    except Exception as e:
        print(f"✗ Error unlinking policy: {e}")
        return False

    # Cleanup: Delete test post
    print("\n6. Cleaning up test post...")
    try:
        response = requests.delete(f"{API_URL}/posts/{test_slug}")
        if response.status_code == 200:
            print(f"✓ Cleaned up test post")
        else:
            print(f"⚠️  Could not delete test post: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Error cleaning up: {e}")

    print("\n✓ All policy linking tests passed!")
    return True

# Test data: mix of categories and publication statuses
TEST_POSTS = [
    {
        "title": "청년 취업 지원 프로그램 A",
        "summary": "만 18-34세 청년을 위한 취업 지원 프로그램",
        "content": "# 청년 취업 지원 프로그램 A\n\n이 프로그램은 청년들의 취업을 돕기 위한 다양한 지원을 제공합니다.\n\n## 지원 내용\n- 취업 교육\n- 멘토링\n- 인턴십 기회",
        "category": "취업",
        "should_publish": True
    },
    {
        "title": "청년 취업 지원 프로그램 B",
        "summary": "IT 분야 청년 취업 지원",
        "content": "# 청년 취업 지원 프로그램 B\n\nIT 분야에 특화된 취업 지원 프로그램입니다.",
        "category": "취업",
        "should_publish": False  # Draft
    },
    {
        "title": "청년 주거 지원 사업",
        "summary": "청년을 위한 주거 비용 지원",
        "content": "# 청년 주거 지원 사업\n\n청년들의 주거 안정을 위한 지원 사업입니다.\n\n## 지원 대상\n- 만 19-34세 청년\n- 소득 기준 충족자",
        "category": "주거",
        "should_publish": True
    },
    {
        "title": "서울시 청년 월세 지원",
        "summary": "서울시 거주 청년 월세 지원",
        "content": "# 서울시 청년 월세 지원\n\n서울시에 거주하는 청년들의 월세를 지원합니다.",
        "category": "주거",
        "should_publish": False  # Draft
    },
    {
        "title": "청년 복지 혜택 안내",
        "summary": "청년이 받을 수 있는 복지 혜택 총정리",
        "content": "# 청년 복지 혜택 안내\n\n청년들이 받을 수 있는 다양한 복지 혜택을 정리했습니다.",
        "category": "복지",
        "should_publish": True
    },
    {
        "title": "청년 의료비 지원 제도",
        "summary": "청년 의료비 지원 안내",
        "content": "# 청년 의료비 지원 제도\n\n청년들의 의료비 부담을 덜어주는 지원 제도입니다.",
        "category": "복지",
        "should_publish": True
    },
    {
        "title": "청년 교육비 지원 프로그램",
        "summary": "대학생 및 취업준비생 교육비 지원",
        "content": "# 청년 교육비 지원 프로그램\n\n교육비 부담을 줄이기 위한 지원 프로그램입니다.",
        "category": "교육",
        "should_publish": True
    },
    {
        "title": "외국어 학습 지원 사업",
        "summary": "청년 외국어 학습 비용 지원",
        "content": "# 외국어 학습 지원 사업\n\n외국어 능력 향상을 위한 학습비 지원 사업입니다.",
        "category": "교육",
        "should_publish": False  # Draft
    },
    {
        "title": "청년 창업 자금 지원",
        "summary": "청년 창업을 위한 금융 지원",
        "content": "# 청년 창업 자금 지원\n\n창업을 준비하는 청년들을 위한 자금 지원 프로그램입니다.",
        "category": "금융",
        "should_publish": True
    },
    {
        "title": "청년 대출 이자 지원",
        "summary": "청년 대출 이자 감면 프로그램",
        "content": "# 청년 대출 이자 지원\n\n청년들의 대출 이자 부담을 줄여주는 프로그램입니다.",
        "category": "금융",
        "should_publish": False  # Draft
    },
    {
        "title": "청년 문화 활동 지원",
        "summary": "청년 문화생활 지원 사업",
        "content": "# 청년 문화 활동 지원\n\n청년들의 문화생활을 위한 지원 사업입니다.",
        "category": "기타",
        "should_publish": True
    },
]

def create_posts():
    """Create test posts via API"""
    created_posts = []

    for post_data in TEST_POSTS:
        # Extract should_publish flag
        should_publish = post_data.pop("should_publish")

        # Create post (will be draft by default)
        print(f"\nCreating post: {post_data['title']}")
        response = requests.post(f"{API_URL}/posts", json=post_data)

        if response.status_code == 200:
            created_post = response.json()
            print(f"✓ Created: {created_post['slug']}")

            # Publish if needed
            if should_publish:
                slug = created_post['slug']
                pub_response = requests.post(f"{API_URL}/posts/{slug}/publish")
                if pub_response.status_code == 200:
                    print(f"✓ Published: {slug}")
                else:
                    print(f"✗ Failed to publish: {pub_response.text}")
            else:
                print(f"  (Kept as draft)")

            created_posts.append(created_post)
        else:
            print(f"✗ Failed to create post: {response.text}")

    return created_posts

def print_summary():
    """Print summary of created posts"""
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)

    # Get all posts
    response = requests.get(f"{API_URL}/posts", params={"limit": 100})
    if response.status_code == 200:
        all_posts = response.json()

        # Count by status
        published = [p for p in all_posts if p['is_published']]
        drafts = [p for p in all_posts if not p['is_published']]

        print(f"\nTotal posts: {len(all_posts)}")
        print(f"Published: {len(published)}")
        print(f"Drafts: {len(drafts)}")

        # Count by category
        categories = {}
        for post in all_posts:
            cat = post['category']
            categories[cat] = categories.get(cat, 0) + 1

        print("\nBy category:")
        for cat, count in sorted(categories.items()):
            print(f"  {cat}: {count}")

        print("\n" + "="*60)
        print("Test the frontend filters:")
        print("  - Filter by category (취업, 주거, 복지, 교육, 금융, 기타)")
        print("  - Filter by status (전체, 발행됨, 미발행)")
        print("  - Combine filters")
        print("="*60)
    else:
        print(f"Failed to fetch posts: {response.text}")

if __name__ == "__main__":
    print("Creating test posts...")
    print("="*60)

    # Check if --test-only flag is provided
    if len(sys.argv) > 1 and sys.argv[1] == "--test-only":
        # Run only integration tests
        success = test_policy_linking()
        sys.exit(0 if success else 1)

    # Run integration tests first
    print("\n" + "="*60)
    print("PHASE 1: Integration Tests")
    print("="*60)
    test_success = test_policy_linking()

    if not test_success:
        print("\n⚠️  Integration tests failed. Stopping.")
        sys.exit(1)

    # Then create sample posts
    print("\n" + "="*60)
    print("PHASE 2: Creating Sample Posts")
    print("="*60)
    created_posts = create_posts()
    print_summary()

    print(f"\n✓ Created {len(created_posts)} test posts!")
    print("\nBackend API: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")

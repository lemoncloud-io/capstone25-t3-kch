import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPosts, type Post } from '@/shared/api/posts'
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components'

// ----------------------------------------------------
// 1) styled-components
// ----------------------------------------------------
const pulse = keyframes`
  0% { background-color: #f0f0f0; }
  50% { background-color: #e0e0e0; }
  100% { background-color: #f0f0f0; }
`;
8
const MainContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 2000px;
  background: #FFFFFF;
  margin: 0 auto;
  overflow-x: hidden;
  box-sizing: border-box;
`;

const CategoryHeroGroup = styled.div`
  position: absolute;
  width: 100%;
  height: 288px;
  left: 0;
  top: 80px;
  background: linear-gradient(90deg, #D9ECFF 0%, #6B9CC9 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* top right bottom left — 왼쪽만 줄여 제목을 왼쪽으로 */
  padding: 0 140px 0 140px;
  box-sizing: border-box;
`;

const HeroTitle = styled.h1`
  width: 280px;
  height: 116px;
  font-style: normal;
  font-weight: 600;
  font-size: 48px;
  line-height: 58px;
  color: #000000;
`;

const CategoryButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const CategoryButton = styled(Link)`
  width: 210px;
  height: 65px;
  background: #FFFFFF;                /* ✔ 항상 흰색 */
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
  color: #000000;
  text-decoration: none;
  transition: background 0.3s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(0,0,0,0.06); /* 경계선 살짝 */
  &:hover { background: #EAEAEA; }
`;

const SkeletonCategoryButton = styled.div`
  width: 210px;
  height: 65px;
  background: #f0f0f0;
  border-radius: 30px;
  animation: ${pulse} 1.5s infinite;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopularPostsSection = styled.section`
  position: absolute;
  width: 932.8px;
  height: auto;
  left: 124px;
  top: 450px;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

const SectionTitle = styled.h2`
  width: 308px;
  height: 45px;
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  line-height: 61px;
  color: #000000;
`;

const PopularPostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  height: 444.86px;

  & > a:nth-child(1) { grid-column: 1 / span 2; grid-row: 1 / span 2; width: 100%; height: 100%; }
  & > a:nth-child(2) { grid-column: 3 / span 1; grid-row: 1 / span 1; }
  & > a:nth-child(3) { grid-column: 4 / span 1; grid-row: 1 / span 1; }
  & > a:nth-child(4) { grid-column: 3 / span 1; grid-row: 2 / span 1; }
  & > a:nth-child(5) { grid-column: 4 / span 1; grid-row: 2 / span 1; }
`;

const PostThumbnailLink = styled(Link)`
  display: block;
  width: 100%;
  height: 100%;
  background: #F5F5F5;
  overflow: hidden;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover { transform: translateY(-5px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
  img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
  &:hover img { transform: scale(1.05); }
`;

const SkeletonPostThumbnail = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  background: #E0E0E0;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  animation: ${pulse} 1.5s infinite;
`;

const LatestPostsSection = styled.section`
  position: absolute;
  width: 954.34px;
  height: auto;
  left: 124px;
  top: 1050px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const CategoryFilterContainer = styled.div`
  display: flex;
  gap: 40px;
  margin-left: 220px;
  margin-bottom: 20px;
`;

interface CategoryFilterButtonProps { isActive: boolean; }

const CategoryFilterButton = styled.button<CategoryFilterButtonProps>`
  background: none;
  border: none;
  padding: 0;
  font-style: normal;
  font-weight: 600;
  font-size: 25px;
  line-height: 30px;
  color: ${props => (props.isActive ? '#6B9CC9' : '#727272')};
  cursor: pointer;
  transition: color 0.3s ease;
  &:hover { color: #6B9CC9; }
`;

const SkeletonCategoryFilterButton = styled.div`
  animation: ${pulse} 1.5s infinite;
  background: transparent;
  width: 100px;
  height: 30px;
  color: transparent;
  border-radius: 4px;
`;

const LatestPostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(301.29px, auto);
  gap: 20px;
  width: 100%;
`;

const FeaturedRow = styled(Link)`
  grid-column: 1 / span 3;          /* 3칸 전체 사용 */
  display: grid;
  grid-template-columns: 1fr 2fr;    /* 좌:이미지 / 우:내용 */
  gap: 20px;
  height: 301.29px;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  overflow: hidden;
  background: transparent;           /* 오른쪽 패널이 자체 배경 가짐 */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover { transform: translateY(-5px); }
`;

const FeaturedImage = styled.div`
  width: 100%;
  height: 100%;
  background: #F5F5F5;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${FeaturedRow}:hover & img { transform: scale(1.05); }
`;

const FeaturedContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 35px;
  width: 100%;
  height: 100%;
  background: #EAEAEA;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SkeletonFeaturedRow = styled.div`
  grid-column: 1 / span 3;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  height: 301.29px;
`;

const SkeletonFeaturedImage = styled.div`
  background: #E0E0E0;
  border-radius: 8px;
  animation: ${pulse} 1.5s infinite;
`;

const SkeletonFeaturedContent = styled.div`
  background: #E0E0E0;
  border-radius: 8px;
  padding: 32px 35px;
  animation: ${pulse} 1.5s infinite;
`;

const SmallPostContainer = styled(Link)`
  width: 100%;
  height: 301.29px;
  background: #F5F5F5;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover { transform: translateY(-5px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
  img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
  &:hover img { transform: scale(1.05); }
`;

const SkeletonSmallPostContainer = styled.div`
  width: 100%;
  height: 301.29px;
  background: #E0E0E0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  animation: ${pulse} 1.5s infinite;
`;

const MainPostTitle = styled.h3`
  font-style: normal;
  font-weight: 600;
  font-size: 40px;
  line-height: 61px;
  color: #000000;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

const MainPostSummary = styled.p`
  font-style: normal;
  font-weight: 600;
  font-size: 25px;
  line-height: 36px;
  color: #727272;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const MainPostDate = styled.span`
  font-style: normal;
  font-weight: 300;
  font-size: 25px;
  line-height: 30px;
  color: #000000;
  align-self: flex-end;
`;

const SkeletonTextLine = styled.div<{ width: string; height: string; marginBottom?: string; alignSelf?: string }>`
  background: #C0C0C0;
  border-radius: 4px;
  width: ${props => props.width};
  height: ${props => props.height};
  margin-bottom: ${props => props.marginBottom || '0'};
  align-self: ${props => props.alignSelf || 'auto'};
`;

// ----------------------------------------------------
// 2) 카테고리 정보(슬러그는 /category/housing|education|jobs|welfare)
// ----------------------------------------------------
const categoryInfo = {
  housing:   { name: '주거지원' },
  education: { name: '교육지원' },
  jobs:      { name: '일자리지원' },
  welfare:   { name: '복지지원' },
} as const

// ----------------------------------------------------
// 3) HomePage
// ----------------------------------------------------
const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('주거지원');

  const getCategorySlugFromName = (name: string) => {
    const entry = Object.entries(categoryInfo).find(([, v]) => v.name === name);
    return entry ? entry[0] : '';
  };

  const { data: popularPosts, isLoading: isLoadingPopular } = useQuery<Post[]>({
    queryKey: ['posts', 'popular'],
    queryFn: () => getPosts(),
  });

  const { data: latestPosts, isLoading: isLoadingLatest } = useQuery<Post[]>({
    queryKey: ['posts', 'latest', activeCategory],
    queryFn: () => getPosts({ category: activeCategory }),
    enabled: !!activeCategory,
  });

  // 로딩
  if (isLoadingPopular || isLoadingLatest) {
    return (
      <MainContainer>
        <CategoryHeroGroup>
          <HeroTitle>당신을 위한<br /> 청년정책</HeroTitle>
          <CategoryButtonsContainer>
            <SkeletonCategoryButton />
            <SkeletonCategoryButton />
            <SkeletonCategoryButton />
            <SkeletonCategoryButton />
          </CategoryButtonsContainer>
        </CategoryHeroGroup>

        <PopularPostsSection>
          <SectionTitle>🔥 인기 포스트</SectionTitle>
          <PopularPostsGrid>
            {[...Array(5)].map((_, i) => <SkeletonPostThumbnail key={i} />)}
          </PopularPostsGrid>
        </PopularPostsSection>

        <LatestPostsSection>
          <SectionTitle>✨ 최신 포스트</SectionTitle>
          <CategoryFilterContainer>
            {Object.values(categoryInfo).map((_, i) => <SkeletonCategoryFilterButton key={i} />)}
          </CategoryFilterContainer>

          <LatestPostsGrid>
            <SkeletonFeaturedRow>
              <SkeletonFeaturedImage />
              <SkeletonFeaturedContent>
                <SkeletonTextLine width="80%" height="50px" marginBottom="15px" />
                <SkeletonTextLine width="60%" height="30px" />
                <SkeletonTextLine width="30%" height="20px" alignSelf="flex-end" />
              </SkeletonFeaturedContent>
            </SkeletonFeaturedRow>
            {[...Array(3)].map((_, i) => <SkeletonSmallPostContainer key={i} />)}
          </LatestPostsGrid>
        </LatestPostsSection>
      </MainContainer>
    );
  }

  // 데이터 가드
  if (!popularPosts || !latestPosts) {
    return <MainContainer />;
  }

  const mainLatestPost = latestPosts[0] ?? null;
  const smallLatestPosts = latestPosts.slice(1, 4);

  return (
    <MainContainer>
      {/* Hero */}
      <CategoryHeroGroup>
        <HeroTitle>당신을 위한<br /> 청년정책</HeroTitle>
        <CategoryButtonsContainer>
          <CategoryButton to="/category/housing">주거지원</CategoryButton>
          <CategoryButton to="/category/education">교육지원</CategoryButton>
          <CategoryButton to="/category/jobs">일자리지원</CategoryButton>
          <CategoryButton to="/category/welfare">복지지원</CategoryButton>
        </CategoryButtonsContainer>
      </CategoryHeroGroup>

      {/* Popular */}
      <PopularPostsSection>
        <SectionTitle>🔥 인기 포스트</SectionTitle>
        <PopularPostsGrid>
          {popularPosts.slice(0, 5).map((post) => (
            <PostThumbnailLink key={post.id} to={`/posts/${post.slug}`}>
              <img src={post.thumbnail} alt={post.title} />
            </PostThumbnailLink>
          ))}
          {popularPosts.length < 5 &&
            [...Array(5 - popularPosts.length)].map((_, i) => (
              <SkeletonPostThumbnail key={`placeholder-popular-${i}`} />
            ))
          }
        </PopularPostsGrid>
      </PopularPostsSection>

      {/* Latest */}
      <LatestPostsSection>
        <SectionTitle>✨ 최신 포스트</SectionTitle>
        <CategoryFilterContainer>
          {Object.values(categoryInfo).map((cat) => (
            <CategoryFilterButton
              key={cat.name}
              isActive={getCategorySlugFromName(cat.name) === activeCategory}
              onClick={() => setActiveCategory(getCategorySlugFromName(cat.name))}
            >
              {cat.name}
            </CategoryFilterButton>
          ))}
        </CategoryFilterContainer>

        <LatestPostsGrid>
          {/* ✅ 대표 포스트: 이미지+내용 한 카드 */}
          {mainLatestPost ? (
            <FeaturedRow to={`/posts/${mainLatestPost.slug}`}>
              <FeaturedImage>
                <img src={mainLatestPost.thumbnail} alt={mainLatestPost.title} />
              </FeaturedImage>
              <FeaturedContent>
                <MainPostTitle>{mainLatestPost.title}</MainPostTitle>
                <MainPostSummary>{mainLatestPost.summary}</MainPostSummary>
                <MainPostDate>{new Date(mainLatestPost.createdAt).toLocaleDateString()}</MainPostDate>
              </FeaturedContent>
            </FeaturedRow>
          ) : (
            <SkeletonFeaturedRow>
              <SkeletonFeaturedImage />
              <SkeletonFeaturedContent>
                <SkeletonTextLine width="80%" height="50px" marginBottom="15px" />
                <SkeletonTextLine width="60%" height="30px" />
                <SkeletonTextLine width="30%" height="20px" alignSelf="flex-end" />
              </SkeletonFeaturedContent>
            </SkeletonFeaturedRow>
          )}

          {/* 그 외 3개 */}
          {smallLatestPosts.map((post) => (
            <SmallPostContainer key={post.id} to={`/posts/${post.slug}`}>
              <img src={post.thumbnail} alt={post.title} />
            </SmallPostContainer>
          ))}
          {smallLatestPosts.length < 3 &&
            [...Array(3 - smallLatestPosts.length)].map((_, i) => (
              <SkeletonSmallPostContainer key={`placeholder-small-${i}`} />
            ))
          }
        </LatestPostsGrid>
      </LatestPostsSection>
    </MainContainer>
  );
};

export default HomePage;

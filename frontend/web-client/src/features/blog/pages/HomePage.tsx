// src/pages/HomePage.tsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPosts, type Post } from '@/shared/api/posts'
import React from 'react'
import styled, { keyframes } from 'styled-components'

/* ==============================
   0) Globals
   ============================== */
const pulse = keyframes`
  0% { background-color: #f0f0f0; }
  50% { background-color: #e0e0e0; }
  100% { background-color: #f0f0f0; }
`

const UI_SCALE = 1

/* ==============================
   1) Canvas
   ============================== */
const PageWrap = styled.div`
  position: relative;
  width: 100%;
  background: #fff;
  overflow-x: hidden;
`

const ScaledRoot = styled.div`
  --ui-scale: ${UI_SCALE};
  position: relative;
  width: calc(1280px / var(--ui-scale));
  height: calc(2320px / var(--ui-scale));
  transform: scale(var(--ui-scale));
  transform-origin: top center;
  margin: 0 auto;
  background: #FFFFFF;
`

/* ===== 상단 카테고리/검색 라인 ===== */
const Breadcrumb = styled.div`
  position: absolute;
  left: 83px;
  top: 50px;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  color: #000000;
`

const CategoryTrack = styled.div`
  position: absolute;
  width: 800px;
  height: 32px;
  left: 85px;
  top: 50px;
`
const Cat = styled.span<{ left: number }>`
  position: absolute;
  left: ${({ left }) => left}px;
  font-weight: 400;
  font-size: 15px;
  line-height: 18px;
  color: #727272;
`
const CatDivider = styled.div`
  position: absolute;
  width: 20px;
  left: 135px;
  top: 10px;
  border-top: 2px solid rgba(195,187,187,0.41);
  transform: rotate(-90deg);
`

/* ===== Search ===== */
const SearchWrap = styled.div`
  position: absolute;
  width: 191px;
  height: 33px;
  left: 820px;
  top: 43px;
`
const SearchBox = styled.div`
  position: absolute;
  inset: 0;
  border: 1.5px solid rgba(86,86,86,0.14);
  border-radius: 25px;
  box-sizing: border-box;
  background: #fff;
`
const SearchCircle = styled.div`
  position: absolute;
  width: 11px;
  height: 11px;
  left: 13px;
  top: 10px;
  border: 1px solid #000;
  border-radius: 50%;
`
const SearchHandle = styled.div`
  position: absolute;
  width: 6.4px;
  left: 23px;
  top: 19px;
  border-top: 1px solid #000;
  transform: rotate(38.66deg);
`
const SearchPlaceholder = styled.div`
  position: absolute;
  left: 44px;
  top: 9px;
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;
  color: #959595;
`

/* ===== Section title ===== */
const SectionTitle = styled.h3<{ left: number; top: number }>`
  position: absolute;
  left: ${({ left }) => left}px;
  top: ${({ top }) => top}px;
  font-weight: 600;
  font-size: 18px;
  line-height: 19px;
  color: #000;
  margin: 0;
`

/* ===== 3-up square cards ===== */
const SquareCard = styled(Link)`
  position: absolute;
  width: 250px;
  height: 250px;
  background: #F5F5F5;
  overflow: hidden;
  border-radius: 4px;
  text-decoration: none;
  img { width: 100%; height: 100%; object-fit: cover; }
`
const SquareSkeleton = styled.div`
  position: absolute;
  width: 250px;
  height: 250px;
  background: #E0E0E0;
  border-radius: 4px;
  animation: ${pulse} 1.5s infinite;
`

/* ===== Mid divider ===== */
const MidDivider = styled.div`
  position: absolute;
  width: 888.01px;
  left: 45px;
  top: 819px;
  opacity: 0.1;
  border-top: 1px solid #383838;
  box-shadow: 0px 1px 2.5px rgba(0,0,0,0.25);
`

/* ===== Reco Title ===== */
const RecoTitle = styled.h2`
  position: absolute;
  left: 84px;
  top: 856px;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
  color: #000;
  margin: 0;
`

/* ===== Blog rows ===== */
const BlogRowWrap = styled.div<{ top: number }>`
  position: absolute;
  width: 888.01px;
  height: 201px;
  left: 23px;
  top: ${({ top }) => top}px;
`

const BlogThumb = styled(Link)`
  position: absolute;
  width: 160px;
  height: 160px;
  left: 712px;
  top: 0px;
  background: #F5F5F5;
  overflow: hidden;
  border-radius: 6px;
  img { width: 100%; height: 100%; object-fit: cover; }
`

const BlogTitle = styled(Link)`
  position: absolute;
  left: 87px;
  top: 18px;
  width: 544px;
  font-weight: 600;
  font-size: 22px;
  line-height: 27px;
  color: #000;
  text-decoration: none;
  overflow: hidden;
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;
`

const BlogExcerpt = styled.div`
  position: absolute;
  left: 87px;
  top: 63px;
  width: 544px;
  font-weight: 400;
  font-size: 15px;
  line-height: 18px;
  color: #727272;
  overflow: hidden;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
`

const BlogMeta = styled.div`
  position: absolute;
  left: 87px;
  top: 148px;
  font-weight: 300;
  font-size: 12px;
  line-height: 15px;
  color: #000;
`

const RowDivider = styled.div<{ top: number }>`
  position: absolute;
  width: 888.01px;
  left: 23px;
  top: ${({ top }) => top}px;
  opacity: 0.1;
  border-top: 1px solid #383838;
  box-shadow: 0px 1px 2.5px rgba(0,0,0,0.25);
`

const BlogRowSkeleton = styled.div<{ top: number }>`
  position: absolute;
  width: 888.01px;
  height: 201px;
  left: 23px;
  top: ${({ top }) => top}px;
  &::before {
    content: '';
    position: absolute;
    left: 712px;
    top: 0;
    width: 160px;
    height: 160px;
    background: #E0E0E0;
    border-radius: 6px;
    animation: ${pulse} 1.5s infinite;
  }
`

const SkeletonLine = styled.div<{ left: number; top: number; w: number; h: number }>`
  position: absolute;
  left: ${({ left }) => left}px;
  top: ${({ top }) => top}px;
  width: ${({ w }) => w}px;
  height: ${({ h }) => h}px;
  background: #E0E0E0;
  border-radius: 4px;
  animation: ${pulse} 1.5s infinite;
`

/* ==============================
   2) Page (기능 + 레이아웃)
   ============================== */
const HomePage: React.FC = () => {
  const { data: popularPosts, isLoading: loadingPopular } = useQuery<Post[]>({
    queryKey: ['posts', 'popular'],
    queryFn: () => getPosts(),
  })
  const { data: latestPosts, isLoading: loadingLatest } = useQuery<Post[]>({
    queryKey: ['posts', 'latest'],
    queryFn: () => getPosts(),
  })

  const isLoading = loadingPopular || loadingLatest
  const safePopular = popularPosts ?? []
  const safeLatest = latestPosts ?? []

  // 개수 고정
  const popular3 = safePopular.slice(0, 3)
  const latest3  = safeLatest.slice(0, 3)
  const blogRows = safeLatest.slice(3, 7) // 4행

  const thumb = (url?: string) => (url && url.length > 0 ? url : '/assets/placeholder.png')

  return (
    <PageWrap>
      <ScaledRoot>
        {/* ==== 상단: 빵부스러기/카테고리/검색 (Header 제거 상태) ==== */}
        <Breadcrumb>블로그 홈</Breadcrumb>
        <CategoryTrack>
          <CatDivider />
          <Cat left={218}>주거지원</Cat>
          <Cat left={318}>교육지원</Cat>
          <Cat left={420}>일자리지원</Cat>
          <Cat left={539}>복지지원</Cat>
        </CategoryTrack>
        <SearchWrap>
          <SearchBox />
          <SearchCircle />
          <SearchHandle />
          <SearchPlaceholder>검색어 입력</SearchPlaceholder>
        </SearchWrap>

        {/* ==== 인기 포스트 ==== */}
        <SectionTitle left={87} top={155}>인기 포스트</SectionTitle>
        {isLoading ? (
          <>
            <SquareSkeleton style={{ left: 84,  top: 191 }} />
            <SquareSkeleton style={{ left: 353, top: 191 }} />
            <SquareSkeleton style={{ left: 622, top: 191 }} />
          </>
        ) : (
          <>
            {(popular3[0])
              ? <SquareCard to={`/posts/${popular3[0].slug}`} style={{ left: 84, top: 191 }}>
                  <img src={thumb(popular3[0].thumbnail)} alt={popular3[0].title} />
                </SquareCard>
              : <SquareSkeleton style={{ left: 84, top: 191 }} />
            }
            {(popular3[1])
              ? <SquareCard to={`/posts/${popular3[1].slug}`} style={{ left: 353, top: 191 }}>
                  <img src={thumb(popular3[1].thumbnail)} alt={popular3[1].title} />
                </SquareCard>
              : <SquareSkeleton style={{ left: 353, top: 191 }} />
            }
            {(popular3[2])
              ? <SquareCard to={`/posts/${popular3[2].slug}`} style={{ left: 622, top: 191 }}>
                  <img src={thumb(popular3[2].thumbnail)} alt={popular3[2].title} />
                </SquareCard>
              : <SquareSkeleton style={{ left: 622, top: 191 }} />
            }
          </>
        )}

        {/* ==== 최신 포스트 ==== */}
        <SectionTitle left={87} top={480}>최신 포스트</SectionTitle>
        {isLoading ? (
          <>
            <SquareSkeleton style={{ left: 84,  top: 516 }} />
            <SquareSkeleton style={{ left: 353, top: 516 }} />
            <SquareSkeleton style={{ left: 622, top: 516 }} />
          </>
        ) : (
          <>
            {(latest3[0])
              ? <SquareCard to={`/posts/${latest3[0].slug}`} style={{ left: 84, top: 516 }}>
                  <img src={thumb(latest3[0].thumbnail)} alt={latest3[0].title} />
                </SquareCard>
              : <SquareSkeleton style={{ left: 84, top: 516 }} />
            }
            {(latest3[1])
              ? <SquareCard to={`/posts/${latest3[1].slug}`} style={{ left: 353, top: 516 }}>
                  <img src={thumb(latest3[1].thumbnail)} alt={latest3[1].title} />
                </SquareCard>
              : <SquareSkeleton style={{ left: 353, top: 516 }} />
            }
            {(latest3[2])
              ? <SquareCard to={`/posts/${latest3[2].slug}`} style={{ left: 622, top: 516 }}>
                  <img src={thumb(latest3[2].thumbnail)} alt={latest3[2].title} />
                </SquareCard>
              : <SquareSkeleton style={{ left: 622, top: 516 }} />
            }
          </>
        )}

        <MidDivider />

        {/* ==== 당신을 위한 청년정책 (리스트 4행) ==== */}
        <RecoTitle>당신을 위한 청년정책</RecoTitle>
        {isLoading ? (
          <>
            {[914, 1138, 1356, 1580].map((top, i) => (
              <React.Fragment key={`row-skel-${i}`}>
                <BlogRowSkeleton top={top} />
                <SkeletonLine left={87} top={top+18} w={380} h={23} />
                <SkeletonLine left={87} top={top+63} w={520} h={45} />
                <SkeletonLine left={87} top={top+148} w={86} h={19} />
                <RowDivider top={[1115,1333,1557,1775][i]} />
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            {blogRows.map((post, i) => {
              const tops   = [914, 1138, 1356, 1580] as const
              const lines  = [1115, 1333, 1557, 1775] as const
              const top    = tops[i]
              const lineY  = lines[i]
              return (
                <React.Fragment key={post.id}>
                  <BlogRowWrap top={top}>
                    <BlogThumb to={`/posts/${post.slug}`}>
                      <img src={thumb(post.thumbnail)} alt={post.title} />
                    </BlogThumb>
                    <BlogTitle to={`/posts/${post.slug}`}>{post.title}</BlogTitle>
                    <BlogExcerpt>{post.summary}</BlogExcerpt>
                    <BlogMeta>{new Date(post.createdAt).toLocaleDateString()}</BlogMeta>
                  </BlogRowWrap>
                  <RowDivider top={lineY} />
                </React.Fragment>
              )
            })}
            {/* 부족한 행은 스켈레톤으로 메움 */}
            {Array.from({ length: Math.max(0, 4 - blogRows.length) }).map((_, j) => {
              const idx = blogRows.length + j
              const tops   = [914, 1138, 1356, 1580] as const
              const lines  = [1115, 1333, 1557, 1775] as const
              return (
                <React.Fragment key={`row-gap-${idx}`}>
                  <BlogRowSkeleton top={tops[idx]} />
                  <SkeletonLine left={87} top={tops[idx]+18}  w={380} h={23} />
                  <SkeletonLine left={87} top={tops[idx]+63}  w={520} h={45} />
                  <SkeletonLine left={87} top={tops[idx]+148} w={86}  h={19} />
                  <RowDivider top={lines[idx]} />
                </React.Fragment>
              )
            })}
          </>
        )}
      </ScaledRoot>
    </PageWrap>
  )
}

export default HomePage

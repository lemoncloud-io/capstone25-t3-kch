// 카테고리별 기본 썸네일 이미지
export const DEFAULT_THUMBNAILS: Record<string, string> = {
    취업: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80', // 노트북, 업무
    주거: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80', // 집, 주택
    복지: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80', // 사람들, 커뮤니티
    교육: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80', // 책, 교육
    금융: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80', // 동전, 금융
    기타: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80', // 일반적인 이미지
}

// 기본 썸네일 (카테고리 매칭 안될 때)
export const FALLBACK_THUMBNAIL = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80'

// 썸네일 가져오기 헬퍼 함수
export const getThumbnail = (category: string, thumbnail?: string | null): string => {
    if (thumbnail) return thumbnail
    return DEFAULT_THUMBNAILS[category] || FALLBACK_THUMBNAIL
}

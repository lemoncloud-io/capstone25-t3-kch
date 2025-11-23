export interface OgTags {
    title?: string
    description?: string
    image?: string
    url?: string
}

export function setOgTags(tags: OgTags) {
    // 기본 메타 태그 설정
    if (tags.title) {
        document.title = tags.title
        setMetaTag('og:title', tags.title)
        setMetaTag('twitter:title', tags.title)
    }
    
    if (tags.description) {
        setMetaTag('description', tags.description)
        setMetaTag('og:description', tags.description)
        setMetaTag('twitter:description', tags.description)
    }
    
    if (tags.image) {
        setMetaTag('og:image', tags.image)
        setMetaTag('twitter:image', tags.image)
    }
    
    if (tags.url) {
        setMetaTag('og:url', tags.url)
    }
}

export function setDefaultOg(tags: Partial<OgTags>) {
    const defaultTags: OgTags = {
        title: 'KCH Blog - 청년 정책 정보',
        description: '청년을 위한 정책과 혜택 정보를 쉽고 빠르게 확인하세요.',
        ...tags
    }
    setOgTags(defaultTags)
}

function setMetaTag(property: string, content: string) {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
    if (!meta) {
        meta = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement
    }
    if (!meta) {
        meta = document.createElement('meta')
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
            meta.setAttribute('property', property)
        } else {
            meta.setAttribute('name', property)
        }
        document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
}
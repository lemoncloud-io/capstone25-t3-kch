// 간단한 OG/Twitter 메타 태그 업데이트 유틸 (SPA용 클라이언트 사이드)

export interface OgOptions {
  title?: string
  description?: string
  image?: string
  url?: string
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setOgTags(opts: OgOptions) {
  const url = opts.url || window.location.href
  const title = opts.title || document.title
  const description = opts.description || ''
  const image = opts.image || ''

  upsertMeta('property', 'og:type', 'article')
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  if (image) upsertMeta('property', 'og:image', absoluteUrl(image))

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  if (image) upsertMeta('name', 'twitter:image', absoluteUrl(image))
}

export function setDefaultOg(opts?: Partial<OgOptions>) {
  const origin = window.location.origin
  const logo = opts?.image || `${origin}/KCodingHansung_logo.png`
  setOgTags({
    title: opts?.title || 'KCH Blog',
    description: opts?.description || '청년정책 블로그',
    image: logo,
    url: opts?.url || window.location.href,
  })
}

function absoluteUrl(url: string) {
  if (!url) return url
  try {
    // 이미 절대경로면 그대로 반환
    const u = new URL(url)
    return u.href
  } catch {
    // 상대경로면 origin 붙여서 반환
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
  }
}




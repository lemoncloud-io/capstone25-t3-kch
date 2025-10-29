export const formatPolicyAmount = (min: number | null, max: number | null): string => {
    if (!min && !max) return '-'
    if (min === max) return `${min?.toLocaleString()}원`
    if (min && max) return `${min.toLocaleString()} ~ ${max.toLocaleString()}원`
    if (min) return `${min.toLocaleString()}원 ~`
    if (max) return `~ ${max.toLocaleString()}원`
    return '-'
}

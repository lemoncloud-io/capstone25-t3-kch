import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Briefcase, Home, Heart, GraduationCap, Coins, MoreHorizontal, Layers } from 'lucide-react'
import { getCategories } from '@/shared/api'

const categoryIcons: Record<string, typeof Home> = {
    취업: Briefcase,
    주거: Home,
    복지: Heart,
    교육: GraduationCap,
    금융: Coins,
    기타: MoreHorizontal,
}

const categoryColors: Record<string, { bg: string; text: string; hover: string; border: string }> = {
    취업: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        hover: 'hover:bg-blue-100 hover:shadow-md hover:scale-105',
        border: 'border-blue-200',
    },
    주거: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        hover: 'hover:bg-green-100 hover:shadow-md hover:scale-105',
        border: 'border-green-200',
    },
    복지: {
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        hover: 'hover:bg-pink-100 hover:shadow-md hover:scale-105',
        border: 'border-pink-200',
    },
    교육: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        hover: 'hover:bg-purple-100 hover:shadow-md hover:scale-105',
        border: 'border-purple-200',
    },
    금융: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        hover: 'hover:bg-yellow-100 hover:shadow-md hover:scale-105',
        border: 'border-yellow-200',
    },
    기타: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        hover: 'hover:bg-gray-100 hover:shadow-md hover:scale-105',
        border: 'border-gray-200',
    },
}

export const CategoryNav = () => {
    // Fetch categories with counts from dedicated API endpoint
    const { data: categories } = useQuery({
        queryKey: ['categories', 'published'],
        queryFn: () => getCategories({ isPublished: true }),
    })

    if (!categories || categories.length === 0) {
        return null
    }

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 mb-8 sm:mb-12">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <Layers className="text-gray-700" size={20} />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">카테고리별 정책</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                {categories.map(({ category, count }) => {
                    const Icon = categoryIcons[category] || MoreHorizontal
                    const colors = categoryColors[category] || categoryColors['기타']

                    return (
                        <Link
                            key={category}
                            to={`/category/${encodeURIComponent(category)}`}
                            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg sm:rounded-xl ${colors.bg} ${colors.hover} border ${colors.border} transition-all duration-200 group`}
                        >
                            <div className={`p-1.5 sm:p-2 rounded-full ${colors.text} mb-2`}>
                                <Icon size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <span className={`text-xs sm:text-sm font-semibold ${colors.text} mb-1 text-center`}>
                                {category}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-500">{count}개</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

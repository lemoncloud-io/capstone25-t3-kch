import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Home, BookOpen, Users, Briefcase } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export default function BlogLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    const categories = [
        { name: '주거지원', icon: Home, path: '/category/housing' },
        { name: '교육지원', icon: BookOpen, path: '/category/education' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">K</span>
                            </div>
                            <span className="font-bold text-xl hidden sm:block">K-Coding Hansung</span>
                        </Link>
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            {categories.map(cat => (
                                <Link
                                    key={cat.path}
                                    to={cat.path}
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </nav>
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2">
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={cn(
                        'md:hidden bg-white border-t transition-all duration-300 overflow-hidden',
                        isMobileMenuOpen ? 'max-h-96' : 'max-h-0'
                    )}
                >
                    <div className="px-4 py-4 space-y-4">
                        {/* Mobile Navigation */}
                        <nav className="space-y-2">
                            {categories.map(cat => (
                                <Link
                                    key={cat.path}
                                    to={cat.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    <cat.icon size={20} className="text-gray-500" />
                                    <span>{cat.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-semibold mb-3">K-Coding Hansung</h3>
                            <p className="text-sm text-gray-600">
                                유레카박스(CMS)를 활용한 AI 기반 블로그 자동 생성 서비스
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">빠른 링크</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>
                                    <Link to="/" className="hover:text-blue-600">
                                        홈
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/category/housing" className="hover:text-blue-600">
                                        주거지원
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/category/education" className="hover:text-blue-600">
                                        교육지원
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">문의</h3>
                            <p className="text-sm text-gray-600">
                                이메일: lemon@lemoncloud.io
                                <br />
                                전화: 02-1234-5678
                            </p>
                        </div>
                    </div>
                    <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
                        © 2025 K-Coding Hansung. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}

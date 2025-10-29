import { Outlet, Link } from 'react-router-dom'

export const BlogLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">K</span>
                            </div>
                            <span className="font-bold text-xl hidden sm:block">K-Coding Hansung</span>
                        </Link>
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
                                    <Link to="/category/주거" className="hover:text-blue-600">
                                        주거지원
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/category/교육" className="hover:text-blue-600">
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

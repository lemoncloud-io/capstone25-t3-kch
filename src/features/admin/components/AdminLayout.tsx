import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
    LayoutDashboard,
    FileText,
    Upload,
    LogOut,
    Menu,
    User
} from 'lucide-react'
import { useAuthStore } from '@/shared/store/authStore'
import { cn } from '@/shared/lib/utils'

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const navigate = useNavigate()
    const { logout } = useAuthStore()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: '대시보드' },
        { path: '/admin/posts', icon: FileText, label: '포스트 관리' },
        { path: '/admin/policy-input', icon: Upload, label: '정책 입력' },
    ]

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:transform-none",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h1 className="text-xl font-bold text-gray-800">관리자 패널</h1>
                    </div>

                    <nav className="flex-1 p-4">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors',
                                        isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    )
                                }
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-4 border-t">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 w-full transition-colors"
                        >
                            <LogOut size={20} />
                            <span>로그아웃</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="bg-white shadow-sm px-4 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex items-center ml-auto">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User size={16} />
                                </div>
                                <span className="text-sm text-gray-700 hidden sm:block">관리자</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

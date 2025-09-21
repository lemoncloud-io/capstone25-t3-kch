import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
    LayoutDashboard,
    FileText,
    Upload,
    LogOut,
    Menu,
    X,
    Bell,
    User
} from 'lucide-react'
import { useAuthStore } from '@/shared/store/authStore'

export default function AdminLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const navigate = useNavigate()
    const { logout } = useAuthStore()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: '대시보드' },
        { path: '/admin/posts', icon: FileText, label: '포스트 관리' },
    ]

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="hidden lg:block w-64 bg-white shadow-lg">
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b">
                        <h1 className="text-xl font-bold text-gray-800">관리자페이지</h1>
                    </div>
                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`
                                    }
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </NavLink>
                            )
                        })}
                    </nav>
                    {/* Logout */}
                    <div className="px-4 py-4 border-t">
                        <button
                            onClick={handleLogout}
                            className="cursor-pointer flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
                        >
                            <LogOut size={20} />
                            <span>로그아웃</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 lg:hidden">
                        <div className="h-full flex flex-col">
                            <div className="h-16 flex items-center justify-between px-6 border-b">
                                <h1 className="text-xl font-bold text-gray-800">관리자페이지</h1>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 px-4 py-6">
                                {menuItems.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                                                    isActive
                                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`
                                            }
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Icon size={20} />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    )
                                })}
                            </nav>

                            <div className="px-4 py-4 border-t">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
                                >
                                    <LogOut size={20} />
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="h-16 bg-white shadow-sm px-4 lg:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    {/* User info */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:block text-sm text-gray-700">Administrator</span>
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User size={16} className="text-gray-600" />
                            </div>
                        </div>
                    </div>
                </header>
                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

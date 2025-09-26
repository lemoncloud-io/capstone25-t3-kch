import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { Lock } from 'lucide-react'

export default function LoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { login } = useAuthStore()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (password === 'admin') {
            login()
            navigate('/admin/dashboard')
        } else {
            setError('비밀번호가 올바르지 않습니다.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">관리자 로그인</h1>
                    <p className="text-gray-600 mt-2">관리자 패널에 접속하려면 로그인하세요</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value)
                                setError('')
                            }}
                            placeholder="비밀번호를 입력하세요"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        로그인
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-4">데모: 비밀번호는 'admin' 입니다</p>
                </form>
            </div>
        </div>
    )
}

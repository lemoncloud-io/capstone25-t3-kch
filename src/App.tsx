import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { Button } from "@/components/ui/button"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold text-blue-500">
          Hello, Tailwind CSS 4.0!
        </h1>
          <div className="flex min-h-svh flex-col items-center justify-center">
      <Button>Click me</Button>
    </div>
      </div>
    </>
  )
}

export default App

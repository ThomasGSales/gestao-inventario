import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from '@/components/ui/button'
import { SuppliersProvider } from './contexts/SuppliersContext';
import AppRouter from './AppRouter.tsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <SuppliersProvider>
        <AppRouter />
      </SuppliersProvider>

    </>
  )
}

export default App

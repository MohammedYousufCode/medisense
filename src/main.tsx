import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import ErrorBoundary from './components/common/ErrorBoundary'

const savedTheme = localStorage.getItem('medisense-theme') || 'dark'
const root = document.documentElement
if (savedTheme === 'light') {
  root.classList.add('light')
  root.classList.remove('dark')
} else {
  root.classList.add('dark')
  root.classList.remove('light')
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)

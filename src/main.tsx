import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedBuiltInCategoriesIfEmpty } from './lib/seed.ts'

void seedBuiltInCategoriesIfEmpty()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './components/common/ToastProvider'
import { routerMode } from './config/runtime'
import 'react-quill/dist/quill.snow.css'
import './styles/variables.css'
import './styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const routerElement =
  routerMode === 'hash' ? (
    <HashRouter>
      <App />
    </HashRouter>
  ) : (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  )

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          {routerElement}
        </QueryClientProvider>
      </ToastProvider>
    </HelmetProvider>
  </StrictMode>,
)

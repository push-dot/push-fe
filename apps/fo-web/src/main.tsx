import '@push/design-system/tokens.css'
import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyMockSearch } from './app/mock-bootstrap'
import Providers from './app/providers'
import AppRouter from './app/router'
import { sessionStore } from './shared/auth/session'

void applyMockSearch(window.location.search, sessionStore).then(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers>
        <AppRouter />
      </Providers>
    </StrictMode>,
  ),
)

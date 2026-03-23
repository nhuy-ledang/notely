import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthProvider'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { PersonalizationProvider } from '@/contexts/PersonalizationProvider'
import { AppRoutes } from './routes'

export default function App() {
  return (
    <BrowserRouter>
      <PersonalizationProvider>
        <AuthProvider>
          <LocaleProvider>
            <AppRoutes />
          </LocaleProvider>
        </AuthProvider>
      </PersonalizationProvider>
    </BrowserRouter>
  )
}

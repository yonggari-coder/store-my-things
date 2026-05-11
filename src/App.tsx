import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import CategoriesPage from './routes/CategoriesPage'
import ContainerPage from './routes/ContainerPage'
import LandingPage from './routes/LandingPage'
import NotFoundPage from './routes/NotFoundPage'
import SearchPage from './routes/SearchPage'
import SettingsPage from './routes/SettingsPage'
import SpacesPage from './routes/SpacesPage'

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    path: '/app',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <SpacesPage /> },
      { path: 's/:spaceId', element: <ContainerPage /> },
      { path: 's/:spaceId/n/:nodeId', element: <ContainerPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/categories', element: <CategoriesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}

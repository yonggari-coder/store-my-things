import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ContainerPage from './routes/ContainerPage'
import NotFoundPage from './routes/NotFoundPage'
import SearchPage from './routes/SearchPage'
import SettingsPage from './routes/SettingsPage'
import SpacesPage from './routes/SpacesPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <SpacesPage /> },
      { path: 's/:spaceId', element: <ContainerPage /> },
      { path: 's/:spaceId/n/:nodeId', element: <ContainerPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

import { useEffect } from 'react'
// Marketing landing page markup + scoped styles, kept as a raw HTML asset so it
// stays easy to edit. The "체험해보기" links point at /app (the React app).
import landingHtml from './landing.html?raw'

const LANDING_TITLE = 'Where is my phone — 우리집을 그려서 정리하는 법'

export default function LandingPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = LANDING_TITLE
    return () => {
      document.title = previousTitle
    }
  }, [])

  return <div dangerouslySetInnerHTML={{ __html: landingHtml }} />
}

import { Masthead } from './components/Masthead'
import { Hero } from './components/Hero'
import { Lede } from './components/Lede'
import { Gallery } from './components/Gallery'
import { Newsletter } from './components/Newsletter'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-paper">
      <a
        href="#gallery"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to gallery
      </a>
      <Masthead />
      <main>
        <Hero />
        <Lede />
        <Gallery />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}

export default App

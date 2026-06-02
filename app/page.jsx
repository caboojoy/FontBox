import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProjectSection from '../components/ProjectSection'
import NewsSection from '../components/NewsSection'
import AboutSection from '../components/AboutSection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProjectSection />
        <NewsSection />
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}

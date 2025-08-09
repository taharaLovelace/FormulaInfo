import { Hero } from '@/components/home/Hero'
import { FeaturedDrivers } from '@/components/home/FeaturedDrivers'
import { LatestRaces } from '@/components/home/LatestRaces'
import { Stats } from '@/components/home/Stats'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Stats />
      <FeaturedDrivers />
      <LatestRaces />
    </div>
  )
}

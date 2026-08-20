import React from 'react'
import Navbar from '../components/layout/Navbar'
import LeftSidebar from '../components/home/LeftSidebar'
import Feed from '../components/home/Feed'
import './Home.css'

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <main className="home-main">
        <div className="home-grid">
          <LeftSidebar />
          <Feed />
        </div>
      </main>
    </div>
  )
}

export default Home
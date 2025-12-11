// @ts-ignore
import InfiniteGrid from './components/InfiniteGrid'
import './App.css'

function App() {
  return (
    <>
      <InfiniteGrid />
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'sans-serif',
        pointerEvents: 'none',
        zIndex: 100
      }}>
        <h2>GSAP Infinite Drag Grid</h2>
        <p>Drag anywhere to explore</p>
      </div>
    </>
  )
}

export default App

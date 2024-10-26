import { useState } from 'react'
import biscorpLogo from './assets/logo.gif'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <img src={biscorpLogo} className="logo" alt="Biscorp logo" />
      </div>
      <h1>Welcome to BiscorpChatNet</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}

export default App

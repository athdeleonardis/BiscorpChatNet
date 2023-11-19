import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout.jsx'
import Home from './components/Home.jsx'
import CreateProfile from './components/CreateProfile.jsx'
import PageNotFound from './components/PageNotFound.jsx'
import TempDisplayProfiles from './components/TempDisplayProfiles.jsx'
import Profile from './components/Profile.jsx'
import Login from './components/Login.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="create-profile" element={<CreateProfile />} />
          <Route path="login" element={<Login />} />
          <Route path="profiles" element={<TempDisplayProfiles />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

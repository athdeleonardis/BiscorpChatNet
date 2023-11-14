import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

function Layout() {
  return (
    <div id="Layout">
      <Navigation />
      <Outlet />
    </div>
  )
}

export default Layout
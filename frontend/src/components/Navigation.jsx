import React from 'react'

import logo from '../assets/logo.gif'

function Navigation() {
  return (
    <nav id="Navigation">
      <ul>
        <li>
          <img src={logo} alt="Logo" />
        </li>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/Login">Login</a>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
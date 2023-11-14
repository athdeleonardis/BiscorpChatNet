import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.gif'

function Navigation() {
  return (
    <nav id="Navigation">
      <ul>
        <li>
          <img src={logo} alt="Logo" />
        </li>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/profiles">Profiles</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
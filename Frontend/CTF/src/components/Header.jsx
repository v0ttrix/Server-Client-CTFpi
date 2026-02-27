import React from 'react'
import { NavLink } from 'react-router'

const Header = () => {
  return (
    <header>
      <div>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/challenges">Challenges</NavLink>
      </div>
    </header>
  );
}

export default Header
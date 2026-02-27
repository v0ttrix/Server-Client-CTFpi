 import React, { useState } from 'react'
   import { NavLink } from 'react-router'

   const Header = () => {
     const [isMenuOpen, setIsMenuOpen] = useState(false);

     const toggleMenu = () => {
       setIsMenuOpen(!isMenuOpen);
     };

     return (
       <header className="flex shadow-md py-4 px-4 sm:px-10
  bg-black min-h-[70px] tracking-wide relative z-50">
         <div className="flex flex-wrap items-center
  justify-between gap-5 w-full">

           {/* Logo - Desktop */}
           <a href="/" className="max-sm:hidden">
             <span className="text-2xl font-bold
  text-green-500">CTF Pi </span>
           </a>

           

           {/* Navigation Menu */}
           <div
             id="collapseMenu"
             className={`${isMenuOpen ? 'block' :
  'max-lg:hidden'} lg:!block max-lg:before:fixed
  max-lg:before:bg-black max-lg:before:opacity-50
  max-lg:before:inset-0 max-lg:before:z-50`}
           >


             {/* Navigation Links */}
             <ul className="lg:flex gap-x-4 max-lg:space-y-3
  max-lg:fixed max-lg:bg-black max-lg:w-1/2
  max-lg:min-w-[300px] max-lg:top-0 max-lg:left-0 max-lg:p-6
  max-lg:h-full max-lg:shadow-md max-lg:overflow-auto z-50
  max-lg:border-r max-lg:border-green-500">



               {/* Home Link */}
               <li className="max-lg:border-b
  max-lg:border-gray-700 max-lg:py-3 px-3">
                 <NavLink
                   to="/"
                   className={({ isActive }) =>
                     isActive
                       ? "text-green-500 block font-medium text-[15px]"
                       : "hover:text-green-400 text-white block font-medium text-[15px]"
                   }
                   onClick={() => setIsMenuOpen(false)}
                 >
                   Home
                 </NavLink>
               </li>

               {/* About Link */}
               <li className="max-lg:border-b
  max-lg:border-gray-700 max-lg:py-3 px-3">
                 <NavLink
                   to="/about"
                   className={({ isActive }) =>
                     isActive
                       ? "text-green-500 block font-medium text-[15px]"
                       : "hover:text-green-400 text-whiteblock font-medium text-[15px]"
                   }
                   onClick={() => setIsMenuOpen(false)}
                 >
                   About
                 </NavLink>
               </li>

               {/* Challenges Link */}
               <li className="max-lg:border-b
  max-lg:border-gray-700 max-lg:py-3 px-3">
                 <NavLink
                   to="/challenges"
                   className={({ isActive }) =>
                     isActive
                       ? "text-green-500 block font-medium text-[15px]":
                        "hover:text-green-400 text-white block font-medium text-[15px]"
                   }
                   onClick={() => setIsMenuOpen(false)}
                 >
                   Challenges
                 </NavLink>
               </li>
             </ul>
           </div>

           
             <svg className="w-7 h-7" fill="#22c55e"
              viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
               <path fillRule="evenodd" d="M3 5a1 1 0
  011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1
   0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1
   1 0 01-1-1z" clipRule="evenodd"></path>
             </svg>
           
         </div>
       </header>
     );
   }

   export default Header
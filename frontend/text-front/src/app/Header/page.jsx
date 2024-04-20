import Link from 'next/link'
import React from 'react'

function Header() {
  return (
    <div className='flex justify-between items-center w-full bg-black h-16'>
        <div className='p-2 mx-4'>
            <Link href="/"><h1 className='font-bold text-white'>TCD</h1></Link>
        </div>
        <div className='p-2 mx-4'>
        <Link href="/"><h1 className='font-bold text-white'>Text Comment Detector</h1></Link>
        </div>
    </div>
  )
}

export default Header
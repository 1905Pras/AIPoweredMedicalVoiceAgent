"use client"
import React from 'react'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const menuOptions = [
  { id: 1, name: 'Home', path: '/dashboard' },
  { id: 2, name: 'History', path: '/dashboard/history' },
  { id: 3, name: 'Pricing', path: '/dashboard/billing' },
]

function AppHeader() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between p-4 shadow px-10 md:px-20 lg:px-40">
      {/* Left: Logo */}
      <Image
        src="/logo.svg"
        alt="logo"
        width={180}
        height={90}
        className="cursor-pointer"
        onClick={() => router.push('/dashboard')}
      />

      {/* Center: Menu */}
      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-12">
        {menuOptions.map((item) => (
          <div
            key={item.id}
            className="cursor-pointer hover:text-primary"
            onClick={() => router.push(item.path)}
          >
            {item.name}
          </div>
        ))}
      </div>

      {/* Right: User button */}
      <div className="hidden md:flex items-center">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  )
}

export default AppHeader

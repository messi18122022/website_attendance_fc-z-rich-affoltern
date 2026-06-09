'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function PinGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (pathname === '/pin') {
      setChecked(true)
      return
    }
    if (sessionStorage.getItem('fca_trainer') === 'true') {
      setChecked(true)
    } else {
      router.replace('/pin')
    }
  }, [pathname, router])

  if (!checked) return null
  return <>{children}</>
}

// src/app/register/page.tsx
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically load the client-only RegisterClient
const RegisterClient = dynamic(() => import('./RegisterClient'), {
  ssr: false,
  suspense: true,
})

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading registration…</div>}>
      <RegisterClient />
    </Suspense>
  )
}

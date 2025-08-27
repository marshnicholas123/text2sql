'use client'

import { Suspense } from 'react'
import Text2SQLApp from './Text2SQLApp'

export default function Text2SQLAppPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <Text2SQLApp />
    </Suspense>
  )
}
import { requireRole } from '@/lib/auth-guard';
import React from 'react'

const page = async() => {
      const user = await requireRole(["CONSUMER"]);
  return (
    <div>
        Consumer Page
    </div>
  )
}

export default page

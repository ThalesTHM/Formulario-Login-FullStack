import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const LoginFormSkeleton = () => {
  return (
    <div className='main-auth-form-container'>
      <div className='auth-form-container bg-slate-50'>
          <form className='flex flex-col justify-center mt-5'>
            <div>
                <Skeleton className='h-3 w-20 bg-slate-700'/>
                <Skeleton className='h-9 w-full mt-1 rounder-lg bg-[#E8F0FE]'/>
            </div>

            <div className='mt-7'>
                <Skeleton className='h-3 w-20 bg-slate-700'/>
                <Skeleton className='h-9 w-full mt-1 bg-[#E8F0FE]'/>
            </div>

            <Skeleton className='h-9 w-full rounded-lg bg-slate-800 mt-7'/>
          </form>
      </div>
    </div>
  )
}

export default LoginFormSkeleton
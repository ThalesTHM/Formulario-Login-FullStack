import { get } from 'http'
import React from 'react'
import { authConfig } from '../api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

const ProtectedPage = async () => {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Acesso Negado</h1>
        <p className="text-lg">Você precisa estar autenticado para ver esta página.</p> 
        
        <Link href='auth/login'>
            <p className='text-blue-700'>Clique aqui para Logar.</p>
        </Link>
      </div>
    )
  }

  return (
    <div>
        <h1 className="text-3xl font-bold">Página Protegida</h1>
        <p className="text-lg">Você só pode ver isso se estiver autenticado.</p>
    </div>
  )
}

export default ProtectedPage
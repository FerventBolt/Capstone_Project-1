'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { createClient } from 'C:/CapstoneProject/Capstone_Project-main/src/lib/supabase/supabase-client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return a mock auth object for now to prevent errors
    return {
      user: null,
      loading: false,
      signIn: async (email: string, password: string) => ({ error: 'Auth not implemented' }),
      signOut: async () => {},
      signUp: async (email: string, password: string, userData: any) => ({ error: 'Auth not implemented' })
    }
  }
  return context
}
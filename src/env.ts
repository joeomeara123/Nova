type EnvGroup = 'openrouter' | 'ecologi' | 'supabase' | 'uploadthing'

interface EnvSoft {
  NEXT_PUBLIC_SUPABASE_URL: string | undefined
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string | undefined
  OPENROUTER_API_KEY: string | undefined
  ECOLOGI_API_KEY: string | undefined
  UPLOADTHING_SECRET: string | undefined
  UPLOADTHING_APP_ID: string | undefined
  supabase: boolean
  openrouter: boolean
  ecologi: boolean
  uploadthing: boolean
}

/**
 * Safe environment access - never throws, returns presence flags
 */
export function getEnvSoft(): EnvSoft {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    ECOLOGI_API_KEY: process.env.ECOLOGI_API_KEY,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
  }

  return {
    ...env,
    supabase: !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    openrouter: !!env.OPENROUTER_API_KEY,
    ecologi: !!env.ECOLOGI_API_KEY,
    uploadthing: !!(env.UPLOADTHING_SECRET && env.UPLOADTHING_APP_ID),
  }
}

/**
 * Strict environment validation - throws if required groups are missing
 */
export function getEnvStrict(required: EnvGroup[]): EnvSoft {
  const env = getEnvSoft()
  const missing: string[] = []

  for (const group of required) {
    if (!env[group]) {
      switch (group) {
        case 'supabase':
          if (!env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL')
          if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
          break
        case 'openrouter':
          if (!env.OPENROUTER_API_KEY) missing.push('OPENROUTER_API_KEY')
          break
        case 'ecologi':
          if (!env.ECOLOGI_API_KEY) missing.push('ECOLOGI_API_KEY')
          break
        case 'uploadthing':
          if (!env.UPLOADTHING_SECRET) missing.push('UPLOADTHING_SECRET')
          if (!env.UPLOADTHING_APP_ID) missing.push('UPLOADTHING_APP_ID')
          break
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return env
}
    import 'server-only'
    import { createClient } from '@supabase/supabase-js'

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const svc = process.env.SUPABASE_SERVICE_ROLE_KEY!

    export const createServerClient = () =>
    createClient(url, svc, {
        db: { schema: 'fonts' },
    })
    
    
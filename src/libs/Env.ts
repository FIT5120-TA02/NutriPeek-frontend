import { createEnv } from '@t3-oss/env-nextjs';

export const Env = createEnv({
  runtimeEnv: {
<<<<<<< HEAD
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
=======
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f
    NODE_ENV: process.env.NODE_ENV,
  },
});

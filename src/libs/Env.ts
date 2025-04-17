import { createEnv } from '@t3-oss/env-nextjs';

export const Env = createEnv({
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
});

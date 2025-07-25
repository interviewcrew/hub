import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ['/'],
  },
  debug: process.env.NODE_ENV === 'development',
});

export const config = { matcher: ['/', '/dashboard/:page*'] };

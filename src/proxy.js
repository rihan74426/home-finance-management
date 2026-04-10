// Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://equipped-pup-46.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Finvites%2F90a978f63b5a359dfc846ab4ab5b2c8b5143eee590230ee14b68fb84cc5e5c2c&__clerk_db_jwt=dvb_3C7fs6dzhsIKvK0b1O8W9oVSwzH. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing). Status code: 200.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes — everything else is protected by default
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/invite(.*)", // invite acceptance landing page
  "/api/webhooks/clerk", // Clerk webhook — uses svix signature, not session
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

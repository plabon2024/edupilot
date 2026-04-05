import { NextRequest, NextResponse } from "next/server";
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, type UserRole } from "./config/authRoutes";
import { jwtUtils } from "./lib/jwtUtils";
import { isTokenExpiringSoon } from "./lib/tokenUtils";
import { getNewTokensWithRefreshToken, getUserInfo } from "./services/auth.services";

async function refreshTokenMiddleware (refreshToken : string) : Promise<boolean> {
    try {
        const refresh = await getNewTokensWithRefreshToken(refreshToken);
        if(!refresh){
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error refreshing token in middleware:", error);
        return false;   
    }
}


export async function proxy (request : NextRequest) {
   try {
       const { pathname } = request.nextUrl; // eg /dashboard, /admin/dashboard, /doctor/dashboard
    const pathWithQuery = `${pathname}${request.nextUrl.search}`;
       const accessToken = request.cookies.get("accessToken")?.value;
       const refreshToken = request.cookies.get("refreshToken")?.value;

       const decodedAccessToken =  accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).data;

       const isValidAccessToken = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).success;

       let userRole: UserRole | null = null;

       if(decodedAccessToken){
            userRole = (decodedAccessToken as any).role as UserRole;
       }

       const routerOwner = getRouteOwner(pathname);

       const isAuth = isAuthRoute(pathname);


       //proactively refresh token if refresh token exists and access token is expired or about to expire
       if (isValidAccessToken && refreshToken && (await isTokenExpiringSoon(accessToken))){
            const requestHeaders = new Headers(request.headers);

            const response = NextResponse.next({
                request: {
                    headers : requestHeaders
            
                },
            })


            try {
                const refreshed = await refreshTokenMiddleware(refreshToken);

                if(refreshed){
                    requestHeaders.set("x-token-refreshed", "1");
                }

                return NextResponse.next(
                    {
                        request: {
                            headers : requestHeaders
                        },
                        headers : response.headers
                    }
                )
            } catch (error) {
                console.error("Error refreshing token:", error);

            }

            return response;
       }


    // Rule - 1 : Logged-in users should not access auth pages,
    // except pages that may be mandatory due to account state.
    if(
     isAuth &&
     isValidAccessToken
    ){
        return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
       }


       // Rule-3 User trying to access Public route -> allow
       if(routerOwner === null){
        return NextResponse.next();
       }

       // Rule - 4 User is Not logged in but trying to access protected route -> redirect to login
       if(!accessToken || !isValidAccessToken){
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathWithQuery);
        return NextResponse.redirect(loginUrl);
       }

       if(accessToken){
            const userInfo = await getUserInfo();

            if(userInfo){
                // need password change scenario
                if (userInfo.needPasswordChange){
                    return NextResponse.next();
                }
            }
       }

       // Rule - 5 User trying to access Common protected route -> allow
       if(routerOwner === "COMMON"){
        return NextResponse.next();
       }

       //Rule-6 User trying to visit role based protected but doesn't have required role -> redirect to their default dashboard

       if(routerOwner === "ADMIN" || routerOwner === "USER"){
            if(routerOwner !== userRole){
                return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
            }
       }

       return NextResponse.next();

   } catch (error) {
         console.error("Error in proxy middleware:", error);
   }
}

export const config = {
    matcher : [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ]
}
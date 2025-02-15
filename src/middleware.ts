import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  console.log("Middleware déclenché pour :", request.nextUrl.pathname);

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    console.log("Aucun header d'authorization trouvé");
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Protected Area"' },
    });
  }

  try {
    const base64Credentials = authHeader.split(" ")[1];
    const decoded = atob(base64Credentials);
    const [username, password] = decoded.split(":");
    console.log("Identifiants décodés :", username, password);

    const validUsername = process.env.BASIC_AUTH_USERNAME;
    const validPassword = process.env.BASIC_AUTH_PASSWORD;

    console.log(
      "vali",
      validPassword,
      password,
      password === validPassword,
      username,
      validUsername,
      username === validUsername
    );

    if (username === validUsername && password === validPassword) {
      console.log("Identifiants valides");
      return NextResponse.next();
    }
  } catch (error) {
    console.error("Erreur lors du décodage :", error);
  }

  console.log("Identifiants invalides");
  return new NextResponse("Invalid credentials", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Protected Area"' },
  });
}

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
};

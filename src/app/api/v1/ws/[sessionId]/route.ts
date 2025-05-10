import { NextRequest, NextResponse } from "next/server";

/**
 * This route handler provides the WebSocket URL for the client
 * It's primarily used in development to work around limitations of WebSocket connections
 * In production, WebSocket connections should be made directly to the backend
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  // Get the API URL from environment variables
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Convert HTTP/HTTPS to WS/WSS
  const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
  const baseUrl = apiUrl.replace(/^http(s?):\/\//, "");
  const wsUrl = `${wsProtocol}://${baseUrl}/api/v1/session/ws/${sessionId}`;

  return NextResponse.json({
    wsUrl,
    sessionId,
    info: "This API provides the WebSocket URL for the client to connect directly",
  });
}

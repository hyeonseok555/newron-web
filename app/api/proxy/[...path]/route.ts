import { type NextRequest, NextResponse } from "next/server";

// 서버 매핑: /api/proxy/{key}/... → 실제 백엔드 URL
const SERVER_MAP: Record<string, string> = {
  main:  process.env.MAIN_API_URL  ?? "https://newron.shop/api/v1",
  pers:  process.env.PERS_API_URL  ?? "http://121.134.239.75:7000",
  ai:    process.env.AI_API_URL    ?? "http://121.134.239.75:8024/api/v1",
  brief: process.env.BRIEF_API_URL ?? "http://121.134.239.75:9000",
};

function buildTargetUrl(pathSegments: string[], searchParams: URLSearchParams): string {
  const [serverKey, ...rest] = pathSegments;
  const base = SERVER_MAP[serverKey];
  if (!base) throw new Error(`Unknown proxy target: ${serverKey}`);

  const path = rest.join("/");
  const query = searchParams.toString();
  return `${base}/${path}${query ? `?${query}` : ""}`;
}

function forwardHeaders(request: NextRequest): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const auth = request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;
  return headers;
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const targetUrl = buildTargetUrl(pathSegments, request.nextUrl.searchParams);

  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.text();

  const response = await fetch(targetUrl, {
    method:  request.method,
    headers: forwardHeaders(request),
    body,
  });

  // SSE 스트리밍 그대로 전달
  if (response.headers.get("content-type")?.includes("text/event-stream")) {
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type":  "text/event-stream",
        "Cache-Control": "no-cache",
        Connection:      "keep-alive",
      },
    });
  }

  const data = await response.text();
  return new NextResponse(data, {
    status:  response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

// GET, POST, PUT, DELETE, PATCH 모두 동일하게 처리
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

// A malformed body (invalid JSON, wrong Content-Type) makes req.json() throw,
// which would otherwise surface as an unhandled 500 instead of a clean 400.
export async function safeJson(req: Request): Promise<unknown | undefined> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

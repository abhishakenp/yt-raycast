type TokenProvider = () => Promise<string | null | undefined>

export async function withAuthTokenHeader(
  options: RequestInit = {},
  getToken?: TokenProvider,
): Promise<RequestInit> {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Authorization') && getToken) {
    let token: string | null | undefined = ''
    try {
      token = await getToken()
    } catch {
      token = ''
    }
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  return { ...options, headers }
}

type StatusLogin = 'unauthenticated' | 'loading' | 'authenticated'

declare namespace ShowroomLogin {
  interface Data {
    ok: 0 | 1
    is_room_owner: 0 | 1
    user_id: number
    room_id: number
    account_id: string
  }

  interface Error {
    error: string
    captcha_url?: string
  }

  interface User {
    id: string
    name: string
    account_id: string
    image: string
    avatar_id: string
    sr_id: string
    is_admin: boolean
    exp: number
  }
}

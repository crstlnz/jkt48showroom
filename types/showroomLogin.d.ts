declare namespace ShowroomLogin {
  interface Data {
    ok: 0 | 1
    is_room_owner: 0 | 1
    user_id: number
    room_id: number
    account_id: string
  }

  interface Error {
    error : string
    captcha_url? : string
  }
}

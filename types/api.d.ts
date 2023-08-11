declare namespace API {
  interface IMemberBirthDay {
    name: string
    birthdate: string
    img: string
    room_id?: string
    url_key?: string
  }

  interface Status {
    code : number
    message : string
  }
}

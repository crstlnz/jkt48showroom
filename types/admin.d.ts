namespace Admin {
  type I48Member = Database.I48Member & { _id: string | null }
  type IShowroomMember = Omit<Database.IShowroomMember, 'member_data'> & {
    _id: string
    member_data: null | I48Member
  }
}

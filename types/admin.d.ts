declare namespace Admin {
  interface FormBasic {
    title: string
    id: string
    component?: string
  }

  interface FormText extends FormBasic {
    placeholder?: string
    data: string
    check: (data: string | string[]) => boolean
  }

  interface FormArrayText extends FormBasic {
    data: string[]
    check: (data: string | string[]) => boolean
  }

  interface FormSelect extends FormBasic {
    data: string
    options: {
      title: string
      value: string
    }[]
    check: (data: string | string[]) => boolean
  }

  interface FormMultipleSelect extends FormBasic {
    data: string[]
    options: {
      title: string
      value: string
    }[]
    check: (data: string | string[]) => boolean
  }

  type Form = FormText | FormSelect | FormArrayText | FormSelect | FormMultipleSelect

  type I48Member = Database.I48Member & { _id: string | null }
  type IdolMemberWithID = IdolMember & { _id: string | null }
  type IShowroomMember = Omit<Database.IShowroomMember, 'member_data'> & {
    _id: string
    member_data: null | IdolMemberWithID
  }

  interface MissingJKT48ID {
    _id: string
    name: string
    img: string
    generation?: string
    isGraduate: boolean
  }

  interface JKT48MemberId {
    id: string
    name: string
  }

  interface ApiMissingJKT48ID {
    members: MissingJKT48ID[]
    jkt48members: JKT48MemberId[]
  }

  interface ApiMemberEditData {
    member: IShowroomMember
    stage48members: IdolMember[]
    jkt48members: JKT48.Member[]
  }
}

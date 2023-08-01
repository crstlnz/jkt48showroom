import { FormNumber, FormSelect, FormText, FormTextArea } from '#components'

export function getForm(formName: string) {
  switch (formName) {
    case 'textarea' :{
      return FormTextArea
    }

    case 'select' :{
      return FormSelect
    }

    case 'number' :{
      return FormNumber
    }

    default : {
      return FormText
    }
  }
}

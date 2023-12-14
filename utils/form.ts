import { FormNumber, FormSelect, FormSelectMultiple, FormText, FormTextArea } from '#components'

export function getForm(formName: string) {
  switch (formName) {
    case 'textarea' :{
      return FormTextArea
    }

    case 'select' :{
      return FormSelect
    }

    case 'selectmultiple' :{
      return FormSelectMultiple
    }

    case 'number' :{
      return FormNumber
    }

    default : {
      return FormText
    }
  }
}

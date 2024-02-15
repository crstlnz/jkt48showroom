import { FormArrayObject, FormArrayString, FormDate, FormNumber, FormSelect, FormSelectMultiple, FormText, FormTextArea } from '#components'

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

    case 'arraystring' :{
      return FormArrayString
    }

    case 'arrayobject' :{
      return FormArrayObject
    }

    case 'date' :{
      return FormDate
    }

    default : {
      return FormText
    }
  }
}

export function isMultiple(component: string | undefined) {
  if (!component) return false
  return ['selectmultiple', 'arraystring', 'arrayobject'].includes(component)
}

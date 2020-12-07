import Validator from 'validator';
import isEmpty from 'lodash/isEmpty'

// types
import { Row } from '../interfaces'

interface Data {
  niPaidNet: string
  niPaidEmployee: string
  rows: Row[]
}

interface Errors {
  niPaidNet?: string
  niPaidEmployee?: string
  rows?: {
    [id: string]: {
      gross?: string
    }
  }
}

interface RowsErrors {
  [id: string]: {
    [rowName: string]: {
      link?: string
      name?: string
      message?: string
    }
  }
}

const validateInput = (data: Data) => {
  let errors: Errors = {}
  let rowsErrors: RowsErrors = {}

  data.rows.forEach(r => {
    
    // Row Gross
    if (Validator.isEmpty(r.gross)) {
      if (!rowsErrors[r.id]) rowsErrors[r.id] = {};
      rowsErrors[r.id].gross = {};
      rowsErrors[r.id].gross.link = `${r.id}-gross`
      rowsErrors[r.id].gross.name = `Gross`
      rowsErrors[r.id].gross.message = 'cannot be empty'
    }
    
    if (!Validator.isEmpty(r.gross) && !Validator.isNumeric(r.gross)) {
      if (!rowsErrors[r.id]) rowsErrors[r.id] = {};
      rowsErrors[r.id].gross = {};
      rowsErrors[r.id].gross.link = `${r.id}-gross`
      rowsErrors[r.id].gross.name = `Gross`
      rowsErrors[r.id].gross.message = 'must be a number'
    }
  })

  // NI Net
  if (Validator.isEmpty(data.niPaidNet)) {
    errors.niPaidNet = 'Enter the National insurance (NI) paid for the net contributions'
  }
  
  if (!Validator.isEmpty(data.niPaidNet) && !Validator.isNumeric(data.niPaidNet)) {
    errors.niPaidNet = 'NI Paid must be a number'
  }
  
  // NI Employee
  if (Validator.isEmpty(data.niPaidEmployee)) {
    errors.niPaidEmployee = 'Enter the National insurance (NI) paid for the employee contributions'
  }
  
  if (!Validator.isEmpty(data.niPaidEmployee) && !Validator.isNumeric(data.niPaidEmployee)) {
    errors.niPaidEmployee = 'NI Paid must be a number'
  }

  return {
    errors,
    rowsErrors,
    isValid: isEmpty(errors) && isEmpty(rowsErrors)
  }
}

export default validateInput
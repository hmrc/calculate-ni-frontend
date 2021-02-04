import React, {useContext} from 'react'

// components
import TextInput from '../../helpers/formhelpers/TextInput'

import numeral from 'numeral'
import 'numeral/locales/en-gb';
import {UnofficialDefermentContext, UnofficialDefermentRow} from "./UnofficialDefermentContext";

numeral.locale('en-gb');

export default function UnofficialDefermentTable(props: {printView: boolean}) {
  const { printView } = props
  const {
    rows,
    setRows,
    categories,
    activeRowId,
    setActiveRowId,
    earningsFields
  } = useContext(UnofficialDefermentContext)

  const handleSelectChange = (r: UnofficialDefermentRow, e: React.ChangeEvent<HTMLSelectElement>) => {
    setRows(rows.map((cur: UnofficialDefermentRow) =>
      cur.id === r.id ? {...cur, [e.currentTarget.name]: e.currentTarget.value} : cur
    ))
  }

  const handleChange = (r: UnofficialDefermentRow, e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveRowId(r.id)
    setRows(rows.map((cur: UnofficialDefermentRow) =>
      cur.id === r.id ?
        {...cur, [`${e.currentTarget.name.split('-')[1]}`]: e.currentTarget.value}
        :
        cur
    ))
  }

  return (
    <table className="contribution-details">
      <thead>
        <tr>
          <th><strong>Name of employer</strong></th>
          <th><strong>Gross pay</strong></th>
          <th><strong>NI category</strong></th>
          <th><strong>{earningsFields['a'].field}</strong></th>
          <th><strong>{earningsFields['b'].field}</strong></th>
          <th><strong>{earningsFields['c'].field}</strong></th>
          {earningsFields['d'] &&
            <th><strong>{earningsFields['d'].field}</strong></th>
          }
          {earningsFields['e'] &&
          <th><strong>{earningsFields['e'].field}</strong></th>
          }
          {earningsFields['f'] &&
          <th><strong>{earningsFields['f'].field}</strong></th>
          }
          <th><strong>Over UEL</strong></th>
          <th><strong>NICS non-CO</strong></th>
          <th><strong>If not U/D</strong></th>
        </tr>
      </thead>

      <tbody>
      {rows.map((r: UnofficialDefermentRow, i: number) => (
        <tr
          key={r.id}
          id={r.id}
          className={activeRowId === r.id ? "active" : ""}
          onClick={() => setActiveRowId(r.id)}
        >
          <td className="input">
            {printView ?
              <div>{r.nameOfEmployer}</div>
              :
              <TextInput
                hiddenLabel={true}
                name={`${r.id}-nameOfEmployer`}
                labelText="Name of employer"
                inputClassName="gross-pay"
                inputValue={r.nameOfEmployer}
                placeholderText="Enter employer name"
                onChangeCallback={(e) => handleChange?.(r, e)}
              />
            }
          </td>
          <td><div>{numeral(r.grossPay).format('$0,0.00')}</div></td>
          <td className="input">
            {printView ?
              <div>{r.category}</div>
              :
              <>
                <label className="govuk-visually-hidden" htmlFor={`row${i}-category`}>Category</label>
                <select name="category" value={r.category} onChange={(e) => handleSelectChange?.(r, e)} className="borderless" id={`row${i}-category`}>
                  {categories.map((c: string, i: number) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </>
            }
          </td>
          <td className="input">
            {printView ?
              <div>{numeral(r.earnings1a).format('$0,0.00')}</div>
              :
              <TextInput
                hiddenLabel={true}
                name={`${r.id}-earnings1a`}
                labelText="LEL"
                inputClassName="gross-pay"
                inputValue={r.earnings1a}
                placeholderText=""
                onChangeCallback={(e) => handleChange?.(r, e)}
              />
            }
          </td>
          <td className="input">
            {printView ?
              <div>{numeral(r.earnings1b).format('$0,0.00')}</div>
              :
              <TextInput
                hiddenLabel={true}
                name={`${r.id}-earnings1b`}
                labelText="LEL"
                inputClassName="gross-pay"
                inputValue={r.earnings1b}
                placeholderText=""
                onChangeCallback={(e) => handleChange?.(r, e)}
              />
            }
          </td>
          <td className="input">
            {printView ?
              <div>{numeral(r.earnings1c).format('$0,0.00')}</div>
              :
              <TextInput
                hiddenLabel={true}
                name={`${r.id}-earnings1c`}
                labelText="LEL"
                inputClassName="gross-pay"
                inputValue={r.earnings1c}
                placeholderText=""
                onChangeCallback={(e) => handleChange?.(r, e)}
              />
            }
          </td>
          {earningsFields['d'] &&
          <td className="input">
            {printView ?
              <div>{numeral(r.earnings1d).format('$0,0.00')}</div>
              :
              <TextInput
                hiddenLabel={true}
                name={`${r.id}-earnings1d`}
                labelText="LEL"
                inputClassName="gross-pay"
                inputValue={r.earnings1d ? r.earnings1d : '0'}
                placeholderText=""
                onChangeCallback={(e) => handleChange?.(r, e)}
              />
            }
          </td>
          }
          {earningsFields['e'] &&
          <td className="input">
            {printView ?
              <div>{numeral(r.earnings1e).format('$0,0.00')}</div>
              :
              <TextInput
                hiddenLabel={true}
                name={`${r.id}-earnings1e`}
                labelText="LEL"
                inputClassName="gross-pay"
                inputValue={r.earnings1e ? r.earnings1e : '0'}
                placeholderText=""
                onChangeCallback={(e) => handleChange?.(r, e)}
              />
            }
          </td>
          }
          {earningsFields['f'] &&
          <td className="input">
            {printView ?
              <div>{numeral(r.earnings1f).format('$0,0.00')}</div>
              :
              <TextInput
                hiddenLabel={true}
                name={`${r.id}-earnings1f`}
                labelText="LEL"
                inputClassName=""
                inputValue={r.earnings1f ? r.earnings1f : '0'}
                placeholderText=""
                onChangeCallback={(e) => handleChange?.(r, e)}
              />
            }
          </td>
          }
          <td>{numeral(r.overUEL).format('$0,0.00')}</td>
          <td>{numeral(r.NICsDueNonCO).format('$0,0.00')}</td>
          <td>{numeral(r.IfNotUD).format('$0,0.00')}</td>
        </tr>
      ))}
      </tbody>
    </table>
  )
}

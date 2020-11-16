import React, { useState } from 'react'

function Summary () {
  const [showSummary, setShowSummary] = useState(false)
  
  const handleToggle = () => {
    setShowSummary(!showSummary)
  }

  return (
    <div className="subsection summary">
      <div className="container">
        <div className="half">
          <h2 className="section-heading">Summary</h2>
        </div>
        <div className="half">
          <button 
            type="button" 
            className="toggle"
            onClick={handleToggle}>
              {showSummary ? 'Close summary' : 'Open summary'}
          </button>
        </div>
      </div>

      {showSummary ? 
          (
            <div className="spaced-table-wrapper">
              <table className="summary spaced-table">
                <thead>
                  <tr className="sections">
                    <th colSpan={2}></th>
                    <th colSpan={3} className="bor-bottom">Earnings</th>
                    <th colSpan={2} className="bor-bottom">Net contributions</th>
                  </tr>
                  <tr>
                    <th>Category</th>
                    <th>Gross pay</th>
                    <th>= LEL</th>
                    <th>LEL - PT</th>
                    <th>ET - UEL</th>
                    <th>Total</th>
                    <th>EE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                  <td className="input-cell">
                      <input type="text" className="half" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                  </tr>
                  <tr>
                    <td>Totals</td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                    <td className="input-cell">
                      <input type="text" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null
      }
    </div>
  )
}

export default Summary;
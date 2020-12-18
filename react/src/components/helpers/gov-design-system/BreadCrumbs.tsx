import React from "react"
import { useLocation } from 'react-router-dom'
import routes from '../../../routes'
import { RouteName } from "../../../interfaces";

export default function BreadCrumbs() {
  const location = useLocation()
  const currentRoute = routes.find(
    (route: RouteName) => route.pathname === location.pathname
  )
  return (
    <div className="govuk-breadcrumbs ">
      <ol className="govuk-breadcrumbs__list">
        <li className="govuk-breadcrumbs__list-item">
          <a className="govuk-breadcrumbs__link" href="/">Home</a>
        </li>
        {currentRoute && currentRoute.pathname !== '/' &&
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href={currentRoute.pathname}>{currentRoute.name}</a>
          </li>
        }
      </ol>
    </div>
  )
}



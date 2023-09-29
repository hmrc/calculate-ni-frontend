import React from "react"
import { useLocation, Link } from 'react-router-dom'
import routes from '../../../routes'
import { RouteName } from "../../../interfaces";

export default function BreadCrumbs() {
  const location = useLocation()
  const currentRoute = routes.find(
    (route: RouteName) => route.pathname === location.pathname
  )
  return (
    <div className="govuk-breadcrumbs" role="navigation">
      <ol className="govuk-breadcrumbs__list">
        <li className="govuk-breadcrumbs__list-item">
          <Link className="govuk-breadcrumbs__link" to="/">Home</Link>
        </li>
        {currentRoute && currentRoute.pathname !== '/' &&
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={currentRoute.pathname}>{currentRoute.name}</Link>
          </li>
        }
      </ol>
    </div>
  )
}



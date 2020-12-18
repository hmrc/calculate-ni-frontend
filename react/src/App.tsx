import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

// css
import './styles/application.scss';
import './styles/gov-polyfill.css';
import './styles/App.css';
import './styles/Typography.css';
import './styles/Forms.css';
import './styles/Tables.css'
import './styles/Errors.css';
import './styles/SavePrint.css';

// components
import Header from './components/helpers/hmrc-design-system/Header'
import PhaseBanner from './components/helpers/gov-design-system/PhaseBanner'
import Nav from './components/Nav'
import Class1 from './components/calculators/class1/Class1'
import Directors from './components/calculators/directors/Directors'
import BreadCrumbs from "./components/helpers/gov-design-system/BreadCrumbs";

function App() {    
  const serviceName = "Calculate National Insurance contributions"
  return (
    <div className="govuk-width-container">
      <Header serviceName={serviceName} />
      <PhaseBanner type="ALPHA" link="#feedback" />
      <div className="main">
        <Router>
          <BreadCrumbs />
          <Switch>
            <Route path="/class-1">
              <Class1 />
            </Route>
            <Route path="/directors">
              <Directors />
            </Route>
            <Route path="/">
              <Nav />
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  );
}

export default App;

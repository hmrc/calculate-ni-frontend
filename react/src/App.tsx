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
import Home from './components/Home'
import Class1 from './components/calculators/class1/Class1'
import Directors from './components/calculators/directors/Directors'
import BreadCrumbs from "./components/helpers/gov-design-system/BreadCrumbs";
import {ClassOneContext, useClassOneForm} from "./components/calculators/class1/ClassOneContext";
import {DirectorsContext, useDirectorsForm} from "./components/calculators/directors/DirectorsContext";

function App() {    
  const serviceName = "Calculate National Insurance contributions"
  return (
      <div className="govuk-width-container">
        <Header serviceName={serviceName} />
        <PhaseBanner type="ALPHA" link="#feedback" />
        <div className="main">
          <Router basename="calculate-ni">
            <BreadCrumbs />
            <Switch>
              <Route path="/class-1">
                <ClassOneContext.Provider value={useClassOneForm()}>
                  <Class1 />
                </ClassOneContext.Provider>
              </Route>
              <Route path="/directors">
                <DirectorsContext.Provider value={useDirectorsForm()}>
                  <Directors />
                </DirectorsContext.Provider>
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Router>
        </div>
      </div>
  );
}

export default App;

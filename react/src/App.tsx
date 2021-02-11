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
import './styles/Layout.css';
import './styles/Typography.css';
import './styles/Forms.css';
import './styles/Tables.css'
import './styles/Errors.css';
import './styles/SavePrint.css';
import './styles/Results.css';

// components
import Header from './components/helpers/hmrc-design-system/Header'
import PhaseBanner from './components/helpers/gov-design-system/PhaseBanner'
import Home from './components/Home'
import Class1 from './components/calculators/class1/Class1'
import Directors from './components/calculators/directors/Directors'
import UnofficialDeferment from './components/calculators/unofficial-deferment/UnofficialDeferment'
import Class2Or3 from './components/calculators/class-2-or-3/Class2Or3'
import Class3 from './components/calculators/class-3/Class3'
import LateInterest from './components/calculators/late-interest/LateInterest'
import LateRefunds from './components/calculators/late-refunds/LateRefunds'
import BreadCrumbs from "./components/helpers/gov-design-system/BreadCrumbs";
import {NiFrontendContext, useNiFrontend} from "./services/NiFrontendContext";

function App() {    
  const serviceName = "National Insurance (NI) Calculation Support Tool"
  return (
    <NiFrontendContext.Provider value={useNiFrontend()}>
      <div className="govuk-width-container">
        <Header serviceName={serviceName} />
        <PhaseBanner type="ALPHA" link="#feedback" />
        <div className="main">
          <Router basename="calculate-ni">
            <BreadCrumbs />
            <Switch>
              <Route path="/class-1">
                <Class1 />
              </Route>
              <Route path="/directors">
                <Directors />
              </Route>
              <Route path="/unofficial-deferment">
                <UnofficialDeferment />
              </Route>
              <Route path="/class-2-or-3">
                <Class2Or3 />
              </Route>
              <Route path="/class-3">
                <Class3 />
              </Route>
              <Route path="/late-interest">
                <LateInterest />
              </Route>
              <Route path="/late-refunds">
                <LateRefunds />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Router>
        </div>
      </div>
    </NiFrontendContext.Provider>
  );
}

export default App;

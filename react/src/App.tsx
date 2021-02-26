import React, {useState} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

// css
import './styles/application.scss'

// components
import Home from './components/Home'
import Class1 from './components/calculators/class1/Class1'
import Directors from './components/calculators/directors/Directors'
import UnofficialDeferment from './components/calculators/unofficial-deferment/UnofficialDeferment'
import Class2Or3 from './components/calculators/class-2-or-3/Class2Or3'
import Class3 from './components/calculators/class-3/Class3'
import LateInterest from './components/calculators/late-interest/LateInterest'
import LateRefunds from './components/calculators/late-refunds/LateRefunds'
import {NiFrontendContext, useNiFrontend} from "./services/NiFrontendContext";
import {SuccessNotificationContext} from "./services/SuccessNotificationContext";
import MainTemplate from "./layout/MainTemplate";

function App() {
  const [successNotificationsOn, setSuccessNotificationsOn] = useState<boolean>(false)

  return (
    <NiFrontendContext.Provider value={useNiFrontend()}>
      <SuccessNotificationContext.Provider value={{successNotificationsOn, setSuccessNotificationsOn}}>
        <Router basename="calculate-ni">
          <MainTemplate>
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
          </MainTemplate>
        </Router>
      </SuccessNotificationContext.Provider>
    </NiFrontendContext.Provider>
  )
}

export default App;

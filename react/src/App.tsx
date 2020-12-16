import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

// css
import './styles/gov-polyfill.css';
import './styles/App.css';
import './styles/Header.css';
import './styles/Typography.css';
import './styles/Forms.css';
import './styles/Tables.css'
import './styles/Errors.css';
import './styles/SavePrint.css';

import Header from './components/Header'
import PhaseBanner from './components/PhaseBanner'

import Class1 from './components/calculators/class1/Class1'
import Directors from './components/calculators/directors/Directors'

function App() {    
  const serviceName = "Calculate National Insurance contributions"
  return (
    <>
      <Header serviceName={serviceName} />
      <PhaseBanner type="ALPHA" />

      <div className="App">
        <div className="main">
          <Router>
            <nav style={{marginBottom: "30px"}}>
              <ul>
                <li><Link to="/">All calculators</Link></li>
                <li><Link to="/class-1">Class 1</Link></li>
                <li><Link to="/directors">Directors</Link></li>
              </ul>
            </nav>

            <Switch>
              <Route path="/class-1">
                <Class1 />
              </Route>
              <Route path="/directors">
                <Directors />
              </Route>
              <Route path="/">
                <h1>Home</h1>
              </Route>
            </Switch>
          </Router>
        </div>
      </div>
    </>
  );
}

export default App;

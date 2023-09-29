import React, {useState} from 'react';
import {
    Routes,
    BrowserRouter as Router,
    Route
} from "react-router-dom";

import './styles/application.scss'

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

const isUnderTests = process.env.NODE_ENV === 'test';

function App() {
    const [successNotificationsOn, setSuccessNotificationsOn] = useState<boolean>(false)
    const router = isUnderTests ? <></> :  <Router basename="calculate-ni">
        <MainTemplate>
            <Routes>
                <Route path="/class-1" element={<Class1 />} />

                <Route path="/directors" element={<Directors />} />
                <Route path="/unofficial-deferment" element={<UnofficialDeferment />} />
                <Route path="/class-2-or-3" element={<Class2Or3 />} />
                <Route path="/class-3" element={<Class3 />} />
                <Route path="/late-interest" element={<LateInterest />} />
                <Route path="/late-refunds" element={<LateRefunds />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </MainTemplate>
    </Router>;

    return (
        <NiFrontendContext.Provider value={useNiFrontend()}>
            <SuccessNotificationContext.Provider value={{successNotificationsOn, setSuccessNotificationsOn}}>
                {router}
            </SuccessNotificationContext.Provider>
        </NiFrontendContext.Provider>
    )
}

export default App;

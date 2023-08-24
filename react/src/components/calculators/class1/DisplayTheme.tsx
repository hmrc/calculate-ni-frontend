import React, {
    useContext
} from "react";

import {ThemeContext} from "./ThemeContext";

const DisplayTheme = function () {
    const theme = useContext(ThemeContext);
    return(
        <p>
            {theme}
        </p>
    );
};

export default DisplayTheme;
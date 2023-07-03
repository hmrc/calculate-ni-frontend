import React, {
    useContext
} from "react";

import {ThemeContext, useTheme} from "./ThemeContext";

const ToggleThemeButton = function () {
    const {
        theme,
        setTheme
    } = useContext(ThemeContext);
    return(
        <button>
            Change Theme
        </button>
    );
};

export default function ThemedButton() {
    return (
        <ThemeContext.Provider value = {useTheme()}>
            <ToggleThemeButton />
        </ThemeContext.Provider>
    )
}


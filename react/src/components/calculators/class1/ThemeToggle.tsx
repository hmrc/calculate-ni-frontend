import React, {
    useContext
} from "react";

import {ThemeContext} from "./ThemeContext";

const ThemeToggle = function () {
    const {
        theme,
        setTheme
    } = useContext(ThemeContext);
    const handleThemeChange = () => {
        if(theme === "Dark Mode") {
            setTheme("Light Mode");
        } else {
            setTheme("Dark Mode");
        }
    };
    return (
        <button className="button govuk-button govuk-button--secondary nomar" type="submit" onClick={handleThemeChange}>
            Change Theme
        </button>
    );
};

export default ThemeToggle;
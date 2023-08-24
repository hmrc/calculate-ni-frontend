import React, {
    useState
} from "react";
import DisplayTheme from "./DisplayTheme"
import ThemeToggle from "./ThemeToggle";
interface ThemeContext {
    theme: string,
    setTheme: Function
}
export const ThemeContext = React.createContext<ThemeContext>(
    {
        theme: "",
        setTheme: () => {}
    }
);

function useTheme() {
    const [theme, setTheme] = useState<string>("Dark Mode");
    return {
        theme,
        setTheme
    };
}

export default function Theme() {
    return (
        <ThemeContext.Provider value = {useTheme()}>
            <DisplayTheme />
            <ThemeToggle />
        </ThemeContext.Provider>
    )
}
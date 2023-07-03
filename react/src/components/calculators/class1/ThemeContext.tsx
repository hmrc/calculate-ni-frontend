import React, {
    useContext,
    useState
} from "react";

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

export function useTheme() {
    const [theme, setTheme] = useState<string>("Dark Mode");
    return {
        theme,
        setTheme
    };
}
export const themes = {
  red: {
    name: "red",
    primary: "#e11d48",
    bg: "#0b0b0f"
  },
  green: {
    name: "green",
    primary: "#22c55e",
    bg: "#07110a"
  },
  blue: {
    name: "blue",
    primary: "#3b82f6",
    bg: "#070b12"
  }
};

export function getTheme(themeName) {
  return themes[themeName] ?? themes.red;
}
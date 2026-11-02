// Colour themes for the storefront. Each one overrides the accent CSS variables from globals.css:
// bright = top bar, buttons and highlights; accent/dark = links and hovers on white; ink = text on the bright colour.
export type Theme = { id: string; name: string; bright: string; accent: string; dark: string; ink: string };

const DARK = "#17191b";
const LIGHT = "#fff";

export const themes: Theme[] = [
  // Sky blues
  { id: "default", name: "Sky", bright: "#02c7fd", accent: "#0077a8", dark: "#005f86", ink: DARK },
  { id: "light-sky", name: "Light Sky", bright: "#87ceeb", accent: "#2b6f8f", dark: "#1f5670", ink: DARK },
  { id: "baby-blue", name: "Baby Blue", bright: "#a7d8f0", accent: "#2f6a8a", dark: "#24526b", ink: DARK },
  { id: "turquoise", name: "Turquoise", bright: "#22c3c3", accent: "#0f7c7c", dark: "#0b5f5f", ink: DARK },
  { id: "azure", name: "Azure", bright: "#0096d6", accent: "#0369a1", dark: "#075985", ink: DARK },
  { id: "deep-sky", name: "Deep Sky", bright: "#0284c7", accent: "#0369a1", dark: "#075985", ink: LIGHT },
  // Yellows
  { id: "lemon", name: "Lemon", bright: "#fff44f", accent: "#7a6d00", dark: "#5c5200", ink: DARK },
  { id: "corn", name: "Corn Yellow", bright: "#fbec5d", accent: "#7a6d00", dark: "#5c5200", ink: DARK },
  { id: "butter", name: "Butter", bright: "#f8e08e", accent: "#8a6d12", dark: "#6b540c", ink: DARK },
  { id: "yellow", name: "Yellow", bright: "#facc15", accent: "#a16207", dark: "#854d0e", ink: DARK },
  { id: "golden-yellow", name: "Golden Yellow", bright: "#ffdf00", accent: "#8a6a00", dark: "#6b5200", ink: DARK },
  { id: "sunflower", name: "Sunflower", bright: "#ffc512", accent: "#a16207", dark: "#854d0e", ink: DARK },
  // Golds & mustards
  { id: "gold", name: "Gold", bright: "#ffd700", accent: "#8a6d12", dark: "#6b540c", ink: DARK },
  { id: "metallic-gold", name: "Metallic Gold", bright: "#d4af37", accent: "#8a6d12", dark: "#6b540c", ink: DARK },
  { id: "antique-gold", name: "Antique Gold", bright: "#c9a227", accent: "#7d6310", dark: "#5e4a0b", ink: DARK },
  { id: "honey", name: "Honey", bright: "#eba937", accent: "#93600f", dark: "#714a0b", ink: DARK },
  { id: "mustard", name: "Mustard", bright: "#e1ad01", accent: "#8a6a00", dark: "#6b5200", ink: DARK },
  { id: "dark-mustard", name: "Dark Mustard", bright: "#c49102", accent: "#7d5c00", dark: "#5e4500", ink: DARK },
  // Ambers & oranges
  { id: "amber", name: "Amber", bright: "#ffbf00", accent: "#b45309", dark: "#92400e", ink: DARK },
  { id: "saffron", name: "Saffron", bright: "#f4c430", accent: "#a16207", dark: "#854d0e", ink: DARK },
  { id: "marigold", name: "Marigold", bright: "#eaa221", accent: "#9a5b0f", dark: "#77460b", ink: DARK },
  { id: "tangerine", name: "Tangerine", bright: "#f28500", accent: "#b4500f", dark: "#8a3c08", ink: DARK },
  { id: "orange", name: "Orange", bright: "#f57224", accent: "#b4500f", dark: "#8a3c08", ink: DARK },
  { id: "burnt-orange", name: "Burnt Orange", bright: "#cc5500", accent: "#a84400", dark: "#843500", ink: DARK },
];

export const THEME_KEY = "theme";

export const themeVars = (theme: Theme) => ({
  "--accent-bright": theme.bright,
  "--accent": theme.accent,
  "--accent-dark": theme.dark,
  "--accent-ink": theme.ink,
});

export const applyTheme = (theme: Theme) => {
  for (const [name, value] of Object.entries(themeVars(theme))) document.documentElement.style.setProperty(name, value);
};

// Runs in <head> before first paint so a saved theme shows without a flash of the default colours.
export const themeScript = `(function(){try{var T=${JSON.stringify(Object.fromEntries(themes.map((theme) => [theme.id, themeVars(theme)])))};var t=T[localStorage.getItem("${THEME_KEY}")];if(t)for(var k in t)document.documentElement.style.setProperty(k,t[k])}catch(e){}})()`;

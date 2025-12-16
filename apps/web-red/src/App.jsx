import { Button } from "@repo/ui";
import { getTheme } from "@repo/theme-tokens";

export default function App() {
  const theme = getTheme("red");

  return (
    <div style={{ padding: 20, background: theme.bg, minHeight: "100vh" }}>
      <h1 style={{ color: theme.primary }}>Web Red</h1>
      <Button style={{ background: theme.primary, color: "white" }}>
        Shared UI Button
      </Button>
    </div>
  );
}

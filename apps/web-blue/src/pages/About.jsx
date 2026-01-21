import { getTheme } from "@repo/theme-tokens";
import { Link } from "react-router-dom";

export default function About() {
  const theme = getTheme("red");

  return (
    <div>
      <h1 style={{ color: theme.primary }}>About Page</h1>

      <Link to="/" style={{ color: theme.primary }}>
        ← Back to Home
      </Link>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "홈" },
  { to: "/analyze", label: "AI 분석" },
  { to: "/examples", label: "결과 예시" },
  { to: "/about", label: "About ISAAC" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-3 max-w-6xl px-4">
        <div className="glass flex items-center justify-between rounded-full px-4 py-2.5 shadow-elegant">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              ISAAC <span className="text-gradient">AI</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/analyze"
            className="hidden md:inline-flex items-center rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background transition-transform hover:scale-105"
          >
            무료 분석
          </Link>
          <Link
            to="/analyze"
            className="md:hidden inline-flex items-center rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
          >
            분석
          </Link>
        </div>
      </div>
    </header>
  );
}

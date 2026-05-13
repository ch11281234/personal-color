import { Link } from "@tanstack/react-router";
import { Github, Mail, Sparkles, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="font-display text-lg font-bold">
                ISAAC <span className="text-gradient">AI</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              아이작(ISAAC)은 AI, 코딩, 테크 서비스를 연구하는 개발 동아리입니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="mb-3 font-semibold">서비스</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/analyze" className="hover:text-foreground">AI 분석</Link></li>
                <li><Link to="/examples" className="hover:text-foreground">결과 예시</Link></li>
                <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold">Contact</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="mailto:hello@isaac.dev" className="hover:text-foreground">hello@isaac.dev</a></li>
                <li><a href="#" className="hover:text-foreground">제휴 문의</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex gap-2">
              <a href="#" aria-label="GitHub" className="glass flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="glass flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="mailto:hello@isaac.dev" aria-label="Email" className="glass flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110">
                <Mail className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ISAAC. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

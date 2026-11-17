"use client";

import * as React from "react";
import { MenuIcon, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: string };
type NavGroup = { label: string; items: NavItem[] };

type AppShellProps = {
  /** The real logo or mark (AS-04), linking home. */
  brand: React.ReactNode;
  /** Work areas first, grouped, about seven items in total (UX-02, NV-07). Settings and help go in `footerNav`. */
  nav: NavGroup[];
  footerNav?: NavItem[];
  /** The current path, used to mark the current item (NV-01). */
  currentPath: string;
  /** Right side of the top bar: the command palette trigger, notifications, account menu. */
  topBar?: React.ReactNode;
  children: React.ReactNode;
};

const isCurrent = (href: string, path: string) => path === href || path.startsWith(`${href}/`);

function NavLinks({ groups, footer, currentPath, onNavigate }: { groups: NavGroup[]; footer?: NavItem[]; currentPath: string; onNavigate?: () => void }) {
  const link = (item: NavItem) => {
    const current = isCurrent(item.href, currentPath);
    return (
      <li key={item.href}>
        <a
          href={item.href}
          aria-current={current ? "page" : undefined}
          onClick={onNavigate}
          className={cn(
            "flex h-9 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-[color,background-color] duration-(--duration-fast) ease-out",
            "hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-foreground",
          )}
        >
          <item.icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{item.label}</span>
          {item.badge ? <span className="ms-auto rounded-full bg-muted px-2 text-xs text-muted-foreground tabular-nums">{item.badge}</span> : null}
        </a>
      </li>
    );
  };
  return (
    <div className="flex h-full flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h2 className="px-3 pb-2 text-xs font-medium text-muted-foreground">{group.label}</h2>
          <ul className="flex flex-col gap-0.5">{group.items.map(link)}</ul>
        </div>
      ))}
      {footer?.length ? <ul className="mt-auto flex flex-col gap-0.5 border-t pt-4">{footer.map(link)}</ul> : null}
    </div>
  );
}

/**
 * Product app layout: skip link, a grouped sidebar with the current page
 * marked, a top bar, and one <main>. Below `lg` the same navigation opens in a
 * dialog from a labelled menu button (RS-07). Pages render their own
 * <PageHeader> inside `children`.
 */
function AppShell({ brand, nav, footerNav, currentPath, topBar, children }: AppShellProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only z-(--z-tooltip) rounded-md bg-background px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:outline-2 focus:outline-ring"
      >
        Skip to content
      </a>

      {/* The column carries the background and border so they run the full page height; only the inner panel is sticky. */}
      <aside className="hidden border-e bg-card lg:block">
        <div className="flex flex-col gap-6 p-4 lg:sticky lg:top-0 lg:h-dvh">
          <div className="px-3 pt-1">{brand}</div>
          <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto">
            <NavLinks groups={nav} footer={footerNav} currentPath={currentPath} />
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-(--z-sticky) flex h-14 items-center gap-3 border-b bg-background/95 px-(--space-gutter) backdrop-blur-sm">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <MenuIcon aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent className="top-0 left-0 h-dvh max-w-xs translate-x-0 translate-y-0 rounded-none p-4">
              <DialogTitle className="sr-only">Navigation</DialogTitle>
              <div className="px-3 pb-4">{brand}</div>
              <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto">
                <NavLinks groups={nav} footer={footerNav} currentPath={currentPath} onNavigate={() => setOpen(false)} />
              </nav>
            </DialogContent>
          </Dialog>
          <div className="min-w-0 shrink-0 lg:hidden">{brand}</div>
          <div className="ms-auto flex min-w-0 items-center gap-2">{topBar}</div>
        </header>
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-(--space-gutter) py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AppShell };
export type { AppShellProps, NavGroup, NavItem };

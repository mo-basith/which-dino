import type { ReactNode } from "react";

// The one header, on every page: the logo on the left, inside the same
// container as the page content (so their left edges line up), and a slot on
// the right (home's nav; nothing elsewhere). 36px tall 24px down on phones;
// 64px with a hairline from 768px.

export function SiteHeader({ logo, right }: { logo: ReactNode; right?: ReactNode }) {
  return (
    <header className="md:border-b md:border-line">
      <div className="site-container mt-6 flex h-9 items-center justify-between md:mt-0 md:h-16">
        {logo}
        {right}
      </div>
    </header>
  );
}

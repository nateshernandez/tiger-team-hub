import { Link } from "@tanstack/react-router"
import { type ReactNode } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type ArtifactPage = {
  to: string
  label: string
}

type ArtifactLayoutProps = {
  title: string
  summary: string
  pages: readonly ArtifactPage[]
  children: ReactNode
}

// The frame every multi-page artifact shares: a way back to the list, the
// title, and the artifact's pages as tabs directly beneath it, so they read
// as pages of this artifact. Each tab is a real link, with its own URL.
export function ArtifactLayout({
  title,
  summary,
  pages,
  children,
}: ArtifactLayoutProps) {
  return (
    // On large screens the artifact fills the window below the site header
    // (h-14), and its page fills what's left with a 0px flex basis (a 0% basis
    // would grow to fit its content), so panels scroll and the page doesn't.
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-4 pb-6 sm:px-6 lg:min-h-[calc(100svh-3.5rem)] lg:px-8">
      <header className="flex flex-col gap-3 pt-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/" />}>
                Artifacts
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            {summary}
          </p>
        </div>
        <nav aria-label={`${title} pages`} className="border-b">
          <ul className="-mb-px flex gap-6 overflow-x-auto">
            {pages.map((page) => (
              <li key={page.to}>
                <Link
                  to={page.to}
                  activeOptions={{ exact: true, includeSearch: false }}
                  data-label={page.label}
                  // The invisible bold copy reserves the bold width, so the
                  // tabs don't shift when the active one turns bold.
                  className="inline-flex h-10 flex-col items-center justify-center border-b-2 border-transparent text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors after:invisible after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)] hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[status=active]:border-foreground data-[status=active]:font-semibold data-[status=active]:text-foreground"
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      {children}
    </div>
  )
}

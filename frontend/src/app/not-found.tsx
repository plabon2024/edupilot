import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  LayoutDashboard,
  ArrowLeft,
  SearchX,
} from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="text-center">
        {/* 404 number */}
        <div className="relative mb-8 inline-block">
          <span
            className="select-none text-[8rem] font-black leading-none tabular-nums text-muted/30 sm:text-[12rem]"
            aria-hidden="true"
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-2xl shadow-violet-500/30">
              <SearchX className="size-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold sm:text-3xl">
          Page not found
        </h1>
        <p className="mx-auto mb-8 max-w-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
            id="go-home-btn"
          >
            <Link href="/">
              <Home className="size-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild id="go-dashboard-btn">
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant="ghost"
 
          >
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
        </div>
      </div>
    </section>
  );
}

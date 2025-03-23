import Link from "next/link";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-6 md:px-8">
          <div className="flex items-center gap-2 font-semibold">
            <Link href="/" className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              <span>KubeSecure</span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-1">
            <Link href="/login">
              <Button size="sm">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>
  )
}

export default Header;
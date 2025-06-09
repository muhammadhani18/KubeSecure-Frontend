import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const Header = () => {
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/login");
  }
  return (

    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-6 md:px-8">
        <div className="flex items-center gap-2 font-semibold">
          <Image src="logo.svg" alt="KubeSecure Dashboard" width={40} height={40} />
          <Link href="/" className="flex items-center gap-2">
            <span>KubeSecure</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center justify-end space-x-1">
          <Button size="sm" onClick={handleLogout}>Logout</Button>
        </nav>
      </div>
    </header>
  )
}

export default Header

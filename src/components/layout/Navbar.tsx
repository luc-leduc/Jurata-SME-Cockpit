import { Search } from "./Search";
import { UserNav } from "./UserNav";
import { Logo } from "./Logo";
import { NotificationCenter } from "./NotificationCenter";

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <div className="flex w-[240px] items-center">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Search />
        </div>
        <div className="flex items-center gap-4">
          <NotificationCenter />
          <UserNav />
        </div>
      </div>
    </div>
  );
}
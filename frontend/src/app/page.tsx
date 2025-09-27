
import { Button } from "@/components/ui/button";
import Link from "next/link";


function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      TODO LANDING
      <Link href='/get-started'>
      <Button variant="default">
        Start
      </Button>
      </Link>
    </div>
  );
}

export default Home;
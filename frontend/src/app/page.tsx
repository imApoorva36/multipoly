"use client";

import { usePrivy } from "@privy-io/react-auth";

import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import UserObject from "@/components/ui/user-object";

function Home() {

  const { ready, authenticated, logout, login } = usePrivy();

  if (!ready) {
    return <FullScreenLoader />;
  }

  return (
    <div className="bg-[#E0E7FF66] md:max-h-[100vh] md:overflow-hidden">
      {authenticated ? (
        <section className="w-full flex flex-col md:flex-row md:h-[calc(100vh-60px)]">
          <div className="flex-grow overflow-y-auto h-full p-4 pl-8">
            <button className="button" onClick={logout}>
              <ArrowLeftIcon className="h-4 w-4" strokeWidth={2} /> Logout
            </button>
          </div>
          <UserObject />
        </section>
      ) : (
        <section className="w-full flex flex-row justify-center items-center h-[calc(100vh-60px)] relative">
          <div className="z-10 flex flex-col items-center justify-center w-full h-full">
          <div className="flex h-10 items-center justify-center rounded-[20px] border border-white px-6 text-lg text-white font-abc-favorit">
            Next.js Demo
          </div>
        <div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
          Starter repo
        </div>
            <div className="text-center text-white text-xl font-normal leading-loose mt-8">
              Get started developing with Privy using our Next.js starter repo
            </div>
            <button
              className="bg-white text-brand-off-black mt-15 w-full max-w-md rounded-full px-4 py-2 hover:bg-gray-100 lg:px-8 lg:py-4 lg:text-xl"
              onClick={() => {
                login();
                setTimeout(() => {
                  (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
                }, 150);
              }}
            >
              Get started
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
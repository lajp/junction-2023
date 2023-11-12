import { useWindowSize } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth, useSigninCheck } from 'reactfire';

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter();
  const signinCheck = useSigninCheck();
  const auth = useAuth();

  const [width] = useWindowSize();

  const isMobile = width < 1024;

  const pageLink = (name: string) => (
    <Link
      key={name}
      className={`font-bold transition ${isMobile ? 'text-md' : 'text-xl'} ${
        pathname === `/${name.toLowerCase()}` ? '' : 'opacity-60 hover:opacity-100'
      }`}
      onClick={() => isMobile && (document.activeElement as any).blur()}
      href={`/${name.toLowerCase()}`}
    >
      {name}
    </Link>
  );

  return (
    <div className="min-h-screen">
      <header className="py-2 fixed top-0 inset-x-0 bg-white z-50 max-w-[100rem] mx-auto px-4 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-[2fr_3fr_2fr] w-full">
          <Link href={'/dashboard'} className="flex items-center gap-2 w-min">
            <img src="/logo.png" alt="Logo" width="40" height="40" style={{ marginLeft: '10px' }} />
            <h1 className="text-3xl font-bold">Restorative</h1>
          </Link>

          {!isMobile && (
            <div className="w-full flex justify-center">
              <div className="flex items-center gap-7">
                {['Dashboard', 'Chat', 'About'].map((item) => pageLink(item))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <div className="flex gap-1 items-center">
              {signinCheck.data?.user && !isMobile && (
                <>
                  <label className="font-bold opacity-70">{signinCheck.data.user.displayName}</label>
                </>
              )}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-square btn-ghost">
                  {signinCheck.data?.user?.photoURL ? (
                    <img className="inline-block h-9 w-9 rounded-full" src={signinCheck.data.user.photoURL} alt="" />
                  ) : (
                    <svg fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      ></path>
                    </svg>
                  )}
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  {isMobile && ['Dashboard', 'Chat', 'About'].map(pageLink)}
                  <span className="m-3">
                    Signed in as:
                    <br />
                    {signinCheck.data?.user?.displayName}
                  </span>
                  <li>
                    <button className="btn btn-sm" onClick={() => signOut(auth)}>
                      Log out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="pt-24 max-w-[100rem] mx-auto px-4 md:px-12">{children}</div>
    </div>
  );
}

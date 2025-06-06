import { NavBar } from "./_components/nav-bar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex w-full h-full min-h-screen">
      <NavBar />
      <main className="w-full mt-16 sm:px-6 py-4 px-2">
        <div className="flex flex-col gap-y-4 py-4 h-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

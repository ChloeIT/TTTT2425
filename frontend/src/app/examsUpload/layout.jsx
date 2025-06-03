import { NavBar } from "../home/_components/nav-bar";

const ExamsUploadLayout = ({ children }) => {
  return (
    <div className="flex w-full h-full min-h-screen">
      <NavBar />
      <main className="w-full mt-16 sm:px-6 py-4 px-2"> {children}</main>
    </div>
  );
};

export default ExamsUploadLayout;

import Footer from "../../components/shared/footer";
import NavBar from "../../components/shared/navbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <NavBar></NavBar>
      <main className="min-h-screen mx-auto bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
        {children}
      </main>

      <Footer></Footer>
    </>
  );
};

export default CommonLayout;

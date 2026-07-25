import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1"> // flex-1 means fill in available space between navbar and footer
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
//provide a consistent layout structure for the application, and allow dynamic page content in the middle
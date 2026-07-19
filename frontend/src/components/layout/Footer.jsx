import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">RL</span>
              </div>
              <span className="text-lg font-bold text-blue-600">RideLink</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Smart carpooling for everyone. Share rides, reduce costs, help the environment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-gray-400 hover:text-blue-600 transition">
                Home
              </Link>
              <Link to="/search" className="text-sm text-gray-400 hover:text-blue-600 transition">
                Find a Ride
              </Link>
              <Link to="/register" className="text-sm text-gray-400 hover:text-blue-600 transition">
                Register
              </Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Account</h4>
            <div className="flex flex-col gap-2">
              <Link to="/login" className="text-sm text-gray-400 hover:text-blue-600 transition">
                Sign In
              </Link>
              <Link to="/register" className="text-sm text-gray-400 hover:text-blue-600 transition">
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} RideLink. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Built with React · Node.js · MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
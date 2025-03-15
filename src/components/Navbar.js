import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Steemit Lottery</h1>
        <ul className="flex space-x-6">
          <li>
            <Link href="/home" className="hover:text-yellow-400 transition">🏠 Home</Link>
          </li>
          <li>
            <Link href="/results" className="hover:text-yellow-400 transition">🏆 Results</Link>
          </li>
          <li>
            <Link href="/entrants" className="hover:text-yellow-400 transition">📅 Today&apos;s Entrants</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

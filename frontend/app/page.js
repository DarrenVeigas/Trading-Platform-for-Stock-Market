import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function Home() {
  return (
    <>
      <ToastContainer />
    <div>
      <h1>Welcome to the Trading App</h1>
      <nav>
        <ul>
          <li>
            <Link href="/register">Register</Link>
          </li>
          <li>
            <Link href="/login">Login</Link>
          </li>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link href="/managefunds">Manage Funds</Link>
          </li>
          <li>
            <Link href="/orders">Order Book</Link>
          </li>
          <li>
            <Link href="/portfolio">Portfolio</Link>
          </li>
          <li>
            <Link href="/trades">Trade Book</Link>
          </li>
          <li>
            <Link href="/bookPL">Book P/L</Link>
          </li>
        </ul>
      </nav>
    </div>
    </>
  );
}

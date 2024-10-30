import Link from 'next/link';

export default function Home() {
  return (
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
        </ul>
      </nav>
    </div>
  );
}

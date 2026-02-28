import { Link } from "react-router-dom";

function Header() {
  return <nav>
    <h1>
        Deep Square
    </h1>
    <ul>
        <li>
            <Link>Play</Link>
            <Link>History</Link>
            <Link>Analytics</Link>
            <Link>Wiki</Link>
        </li>
    </ul>
  </nav>;
}

export default Header
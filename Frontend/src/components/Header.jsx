import { Link } from "react-router-dom";
import "./styles/Header.css"
import logo from "../assets/DEEPSQUARE_LOGO.jpg"

function Header() {
  return <nav>
    <div>
        <img id="logo-img" src={logo} alt="Deep Square Logo"></img>
        <h1>DEEP SQUARE</h1>
    </div>
    <ul>
        <li>
            <Link to={"/"}>Play</Link>
            <Link to={"/analytics"}>Analytics</Link>
            {/* <Link>Analytics</Link>
            <Link>Wiki</Link> */}
        </li>
    </ul>
  </nav>;
}

export default Header
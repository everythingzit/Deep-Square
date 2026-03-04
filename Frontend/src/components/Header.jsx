import { NavLink } from "react-router-dom";
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
            <NavLink to={"/"}>Play</NavLink>
            <NavLink to={"/analytics"}>Analytics</NavLink>
            {/* <Link>Analytics</Link>
            <Link>Wiki</Link> */}
        </li>
    </ul>
  </nav>;
}

export default Header
import "./styles/Footer.css"
import { Link } from "react-router-dom"
 
function Footer() {
  return <footer>
    <div className="footer-link-container">
        <h3>
            Deep Square
        </h3>
        <Link to={"/"}>
            Play
        </Link>
        <Link to={"/analytics"}>
            Analytics
        </Link>
        <Link>
            Wiki
        </Link>
    </div>
    <div className="footer-link-container">
        <h3>
            Social
        </h3>
        <a href="https://github.com/everythingzit" target="blank">
            GitHub
        </a>
        <a href="https://www.linkedin.com/in/hendrik-tebeng/" target="_blank">
            LinkedIn
        </a>
        <a>
            Portfolio
        </a>
        <a href="https://devpost.com/hnt-nzodoum" target="_blank">
            Devpost
        </a>
    </div>
    <div className="footer-link-container">
        <h3>
            Contact
        </h3>
        <p>
            Hendrik Tebeng
        </p>
        <p>
            Montreal, Qc
        </p>
        <p>
            hendriktebeng@gmail.com
        </p>
        <p>
            (514) 913 - 0305
        </p>
    </div>
  </footer>;
}

export default Footer
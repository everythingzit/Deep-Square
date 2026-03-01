import "./styles/Footer.css"

function Footer() {
  return <footer>
    <div className="footer-link-container">
        <h3>
            Deep Square
        </h3>
        <a>
            Play
        </a>
        <a>
            History
        </a>
        <a>
            Analytics
        </a>
        <a>
            Wiki
        </a>
    </div>
    <div className="footer-link-container">
        <h3>
            Social
        </h3>
        <a>
            GitHub
        </a>
        <a>
            LinkedIn
        </a>
        <a>
            Portfolio
        </a>
        <a>
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
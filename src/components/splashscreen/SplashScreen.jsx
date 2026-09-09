import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import logoTitle from "@/src/config/logoTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";

const FAQ_ITEMS = [
  {
    question: "Is Kizora safe?",
    answer: "Yes, Kizora is completely safe to use. We ensure all content is properly scanned and secured for our users."
  },
  {
    question: "What makes Kizora the best site to watch anime free online?",
    answer: "Kizora offers high-quality streaming, a vast library of anime, no intrusive ads, and a user-friendly interface - all completely free."
  },
  {
    question: "How do I request an anime?",
    answer: "You can submit anime requests through our contact form or by reaching out to our support team."
  }
];

function SplashScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleSearchSubmit = useCallback(() => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;
    const queryParam = encodeURIComponent(trimmedSearch);
    navigate(`/search?keyword=${queryParam}`);
  }, [search, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="splash-container">
      <div className="splash-overlay"></div>
      <div className="content-wrapper">
        <div className="logo-container">
          <img src="/kizora.png" alt={logoTitle} className="logo" />
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search anime..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="search-button"
            onClick={handleSearchSubmit}
            aria-label="Search"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        <Link to="/home" className="enter-button">
          Enter Homepage <FontAwesomeIcon icon={faAngleRight} className="angle-icon" />
        </Link>

        <div className="faq-section">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{item.question}</span>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`faq-toggle ${expandedFaq === index ? 'rotate' : ''}`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="faq-answer">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;

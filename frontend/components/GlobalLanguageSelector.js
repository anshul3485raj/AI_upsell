"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const languages = [
  { value: "", label: "Select Language" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "zh-TW", label: "Chinese (Traditional)" },
  { value: "nl", label: "Dutch" },
  { value: "en", label: "English" },
  { value: "fil", label: "Filipino" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "pt", label: "Portuguese (Brazil)" },
  { value: "ro", label: "Romanian" },
  { value: "ru", label: "Russian" },
  { value: "es", label: "Spanish" },
  { value: "tr", label: "Turkish" },
];

// ✅ FIX 1: Safe cookie (no domain)
function setTranslateCookie(value) {
  document.cookie = `googtrans=${value};path=/`;
}

// ✅ FIX 2: Read cookie safely
function getTranslateCookie() {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

// ✅ FIX 3: Retry mechanism (important for Shopify iframe)
function triggerGoogleTranslate(language, retry = 10) {
  const combo = document.querySelector(".goog-te-combo");

  if (!combo && retry > 0) {
    setTimeout(() => triggerGoogleTranslate(language, retry - 1), 300);
    return false;
  }

  if (!combo) return false;

  combo.value = language;
  combo.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

export default function GlobalLanguageSelector() {
  const pathname = usePathname();
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // Load saved language
  useEffect(() => {
    const cookie = getTranslateCookie();
    if (!cookie) return;

    const lang = cookie.split("/")[2] || "";
    setSelectedLanguage(lang === "en" ? "" : lang);
  }, []);

  // Load Google Translate Script
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: languages
            .filter((l) => l.value)
            .map((l) => l.value)
            .join(","),
          autoDisplay: false,
        },
        "google_translate_element"
      );

      const cookie = getTranslateCookie();
      const lang = cookie.split("/")[2];

      if (lang && lang !== "en") {
        setTimeout(() => triggerGoogleTranslate(lang), 800);
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      window.googleTranslateElementInit();
    }

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  // Re-trigger on route change (Shopify safe)
  useEffect(() => {
    if (!selectedLanguage) return;

    setTimeout(() => {
      triggerGoogleTranslate(selectedLanguage);
    }, 600);
  }, [pathname]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);

    if (!lang || lang === "en") {
      setTranslateCookie("/en/en");
      triggerGoogleTranslate("en");
      return;
    }

    setTranslateCookie(`/en/${lang}`);
    triggerGoogleTranslate(lang);
  };

  return (
    <>
      <label className="app-language-select" htmlFor="app-language">
        <select
          id="app-language"
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          {languages.map((l) => (
            <option key={l.label} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </label>

      {/* Hidden Google element */}
      <div
        id="google_translate_element"
        style={{ display: "none" }}
      />
    </>
  );
}
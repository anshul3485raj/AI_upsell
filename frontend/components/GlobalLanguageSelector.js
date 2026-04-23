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

function setTranslateCookie(value) {
  document.cookie = `googtrans=${value};path=/`;

  const hostname = window.location.hostname;
  if (hostname.includes(".")) {
    document.cookie = `googtrans=${value};path=/;domain=.${hostname}`;
  }
}

function getTranslateCookie() {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function triggerGoogleTranslate(language) {
  const combo = document.querySelector(".goog-te-combo");
  if (!combo) return false;

  combo.value = language;
  combo.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

export default function GlobalLanguageSelector() {
  const pathname = usePathname();
  const [selectedLanguage, setSelectedLanguage] = useState("");

  useEffect(() => {
    const existingCookie = getTranslateCookie();
    if (!existingCookie) return;

    const parts = existingCookie.split("/");
    const currentLanguage = parts[2] || "";
    setSelectedLanguage(currentLanguage === "en" ? "" : currentLanguage);
  }, []);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: languages
            .filter((item) => item.value)
            .map((item) => item.value)
            .join(","),
          autoDisplay: false,
          layout:
            window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element",
      );

      const existingCookie = getTranslateCookie();
      const currentLanguage = existingCookie.split("/")[2] || "";
      if (currentLanguage && currentLanguage !== "en") {
        window.setTimeout(() => {
          triggerGoogleTranslate(currentLanguage);
        }, 700);
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  useEffect(() => {
    if (!selectedLanguage) return;

    const timer = window.setTimeout(() => {
      triggerGoogleTranslate(selectedLanguage);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [pathname, selectedLanguage]);

  const handleLanguageChange = (event) => {
    const language = event.target.value;
    setSelectedLanguage(language);

    if (!language || language === "en") {
      setTranslateCookie("/en/en");
      window.location.reload();
      return;
    }

    setTranslateCookie(`/en/${language}`);

    if (!triggerGoogleTranslate(language)) {
      window.location.reload();
      return;
    }

    window.setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  return (
    <>
      <label className="app-language-select" htmlFor="app-language">
        <select
          id="app-language"
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          {languages.map((language) => (
            <option key={language.label} value={language.value}>
              {language.label}
            </option>
          ))}
        </select>
      </label>
      <div id="google_translate_element" className="google-translate-element" />
    </>
  );
}

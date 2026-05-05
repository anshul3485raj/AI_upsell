"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "ai-upsell-language";
const ATTRIBUTE_NAMES = ["placeholder", "title", "aria-label"];
const INPUT_VALUE_TYPES = new Set(["button", "submit", "reset"]);
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "TEXTAREA", "SELECT", "OPTION"]);

const LanguageContext = createContext({
  selectedLanguage: "en",
  setSelectedLanguage: () => {},
});

function hasTranslatableContent(value) {
  return typeof value === "string" && /[A-Za-z]/.test(value);
}

function isIgnoredElement(element) {
  if (!element) {
    return true;
  }

  if (SKIP_TAGS.has(element.tagName)) {
    return true;
  }

  return Boolean(element.closest("[data-no-translate='true']"));
}

export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguageState] = useState("en");
  const originalTextRef = useRef(new WeakMap());
  const originalAttrRef = useRef(new WeakMap());
  const translatedCacheRef = useRef(new Map());
  const observerRef = useRef(null);
  const isApplyingRef = useRef(false);
  const requestIdRef = useRef(0);

  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL;

  const setSelectedLanguage = useCallback((language) => {
    const nextLanguage = language || "en";
    setSelectedLanguageState(nextLanguage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    }
  }, []);

  const getOriginalText = useCallback((node, effectiveLanguage) => {
    const currentValue = node.textContent || "";
    const existingValue = originalTextRef.current.get(node);

    if (!existingValue) {
      originalTextRef.current.set(node, currentValue);
      return currentValue;
    }

    if (effectiveLanguage !== "en") {
      const cachedTranslation = translatedCacheRef.current.get(
        `text:${effectiveLanguage}:${existingValue}`,
      );
      if (cachedTranslation !== currentValue) {
        originalTextRef.current.set(node, currentValue);
        return currentValue;
      }
    }

    return existingValue;
  }, []);

  const getOriginalAttribute = useCallback((element, attributeName, effectiveLanguage) => {
    const currentValue = element.getAttribute(attributeName) || "";
    let attributeMap = originalAttrRef.current.get(element);

    if (!attributeMap) {
      attributeMap = new Map();
      originalAttrRef.current.set(element, attributeMap);
    }

    const existingValue = attributeMap.get(attributeName);
    if (!existingValue) {
      attributeMap.set(attributeName, currentValue);
      return currentValue;
    }

    if (effectiveLanguage !== "en") {
      const cachedTranslation = translatedCacheRef.current.get(
        `attr:${attributeName}:${effectiveLanguage}:${existingValue}`,
      );
      if (cachedTranslation !== currentValue) {
        attributeMap.set(attributeName, currentValue);
        return currentValue;
      }
    }

    return existingValue;
  }, []);

  const collectTranslatableEntries = useCallback((root, effectiveLanguage) => {
    const textEntries = [];
    const attributeEntries = [];

    if (!root || typeof document === "undefined") {
      return { textEntries, attributeEntries };
    }

    const baseElement = root.nodeType === Node.ELEMENT_NODE ? root : root.parentElement;
    if (baseElement && isIgnoredElement(baseElement)) {
      return { textEntries, attributeEntries };
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let currentNode = walker.nextNode();
    while (currentNode) {
      const parentElement = currentNode.parentElement;
      if (parentElement && !isIgnoredElement(parentElement)) {
        const originalValue = getOriginalText(currentNode, effectiveLanguage);
        if (hasTranslatableContent(originalValue)) {
          textEntries.push({ node: currentNode, originalValue });
        }
      }
      currentNode = walker.nextNode();
    }

    const elements = [];
    if (root.nodeType === Node.ELEMENT_NODE) {
      elements.push(root);
    }
    if (root.querySelectorAll) {
      elements.push(...root.querySelectorAll("*"));
    }

    for (const element of elements) {
      if (!(element instanceof HTMLElement) || isIgnoredElement(element)) {
        continue;
      }

      for (const attributeName of ATTRIBUTE_NAMES) {
        const currentValue = element.getAttribute(attributeName);
        if (!hasTranslatableContent(currentValue)) {
          continue;
        }

        const originalValue = getOriginalAttribute(element, attributeName, effectiveLanguage);
        if (hasTranslatableContent(originalValue)) {
          attributeEntries.push({ element, attributeName, originalValue });
        }
      }

      if (
        element instanceof HTMLInputElement &&
        INPUT_VALUE_TYPES.has(element.type) &&
        hasTranslatableContent(element.value)
      ) {
        const originalValue = getOriginalAttribute(element, "value", effectiveLanguage);
        if (hasTranslatableContent(originalValue)) {
          attributeEntries.push({ element, attributeName: "value", originalValue });
        }
      }
    }

    return { textEntries, attributeEntries };
  }, [getOriginalAttribute, getOriginalText]);

  const applyOriginalContent = useCallback((root) => {
    const { textEntries, attributeEntries } = collectTranslatableEntries(root, "en");

    isApplyingRef.current = true;
    for (const entry of textEntries) {
      if (entry.node.textContent !== entry.originalValue) {
        entry.node.textContent = entry.originalValue;
      }
    }

    for (const entry of attributeEntries) {
      if (entry.attributeName === "value" && entry.element instanceof HTMLInputElement) {
        if (entry.element.value !== entry.originalValue) {
          entry.element.value = entry.originalValue;
        }
        continue;
      }

      if (entry.element.getAttribute(entry.attributeName) !== entry.originalValue) {
        entry.element.setAttribute(entry.attributeName, entry.originalValue);
      }
    }
    isApplyingRef.current = false;
  }, [collectTranslatableEntries]);

  const fetchTranslations = useCallback(async (texts, language) => {
    if (!backendBase) {
      return texts;
    }

    const response = await fetch(`${backendBase}/translations/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texts,
        sourceLanguage: "en",
        targetLanguage: language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation request failed with status ${response.status}.`);
    }

    const payload = await response.json();
    return Array.isArray(payload?.translations) ? payload.translations : texts;
  }, [backendBase]);

  const translateTree = useCallback(async (root, language) => {
    if (typeof document === "undefined") {
      return;
    }

    if (language === "en") {
      applyOriginalContent(root || document.body);
      document.documentElement.lang = "en";
      return;
    }

    const { textEntries, attributeEntries } = collectTranslatableEntries(
      root || document.body,
      language,
    );

    const pendingTexts = [];
    const seen = new Set();

    for (const entry of textEntries) {
      const cacheKey = `text:${language}:${entry.originalValue}`;
      if (!translatedCacheRef.current.has(cacheKey) && !seen.has(cacheKey)) {
        seen.add(cacheKey);
        pendingTexts.push(entry.originalValue);
      }
    }

    for (const entry of attributeEntries) {
      const cacheKey = `attr:${entry.attributeName}:${language}:${entry.originalValue}`;
      if (!translatedCacheRef.current.has(cacheKey) && !seen.has(cacheKey)) {
        seen.add(cacheKey);
        pendingTexts.push(entry.originalValue);
      }
    }

    const currentRequestId = ++requestIdRef.current;

    if (pendingTexts.length > 0) {
      const translatedValues = await fetchTranslations(pendingTexts, language);
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      pendingTexts.forEach((originalValue, index) => {
        const translatedValue = translatedValues[index] || originalValue;
        translatedCacheRef.current.set(`text:${language}:${originalValue}`, translatedValue);
        for (const attributeName of ATTRIBUTE_NAMES) {
          translatedCacheRef.current.set(
            `attr:${attributeName}:${language}:${originalValue}`,
            translatedValue,
          );
        }
        translatedCacheRef.current.set(`attr:value:${language}:${originalValue}`, translatedValue);
      });
    }

    isApplyingRef.current = true;

    for (const entry of textEntries) {
      const translatedValue =
        translatedCacheRef.current.get(`text:${language}:${entry.originalValue}`) ||
        entry.originalValue;
      if (entry.node.textContent !== translatedValue) {
        entry.node.textContent = translatedValue;
      }
    }

    for (const entry of attributeEntries) {
      const translatedValue =
        translatedCacheRef.current.get(
          `attr:${entry.attributeName}:${language}:${entry.originalValue}`,
        ) || entry.originalValue;

      if (entry.attributeName === "value" && entry.element instanceof HTMLInputElement) {
        if (entry.element.value !== translatedValue) {
          entry.element.value = translatedValue;
        }
        continue;
      }

      if (entry.element.getAttribute(entry.attributeName) !== translatedValue) {
        entry.element.setAttribute(entry.attributeName, translatedValue);
      }
    }

    isApplyingRef.current = false;
    document.documentElement.lang = language;
  }, [applyOriginalContent, collectTranslatableEntries, fetchTranslations]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLanguage = window.localStorage.getItem(STORAGE_KEY) || "en";
    setSelectedLanguageState(storedLanguage);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    translateTree(document.body, selectedLanguage).catch((error) => {
      console.error("Failed to apply app language:", error);
    });
  }, [selectedLanguage, translateTree]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      if (isApplyingRef.current) {
        return;
      }

      if (selectedLanguage === "en") {
        return;
      }

      for (const mutation of mutations) {
        if (mutation.type === "characterData" && mutation.target?.parentElement) {
          translateTree(mutation.target.parentElement, selectedLanguage).catch((error) => {
            console.error("Failed to update translated text:", error);
          });
          continue;
        }

        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
            translateTree(node.parentElement, selectedLanguage).catch((error) => {
              console.error("Failed to translate inserted text:", error);
            });
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            translateTree(node, selectedLanguage).catch((error) => {
              console.error("Failed to translate inserted content:", error);
            });
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [selectedLanguage, translateTree]);

  const value = useMemo(
    () => ({
      selectedLanguage,
      setSelectedLanguage,
    }),
    [selectedLanguage, setSelectedLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

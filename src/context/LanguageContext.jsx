import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { translationService, SUPPORTED_LANGUAGES } from '../services/translation.service.js';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState(() => {
    return localStorage.getItem('norozz_language') || 'hi-IN';
  });

  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  // In-memory translation cache: key: `${targetLang}_${text}` -> translatedText
  const cacheRef = useRef(new Map());
  const isTranslatingRef = useRef(false);
  const observerRef = useRef(null);

  const setLanguage = (langCode) => {
    if (!langCode) return;
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    const targetCode = found ? found.code : 'en-IN';
    setCurrentLanguageState(targetCode);
    localStorage.setItem('norozz_language', targetCode);
  };

  /**
   * Check if a text string should be translated
   */
  const shouldTranslateText = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    if (trimmed.length < 2) return false;
    // Skip if string is purely numbers, symbols, times, or hex codes (e.g. ₹0, 10:30, 5.0, #NZP-B-123)
    if (/^[0-9\s\.,:\/\\#\$\%₹\-\+\(\)\*\&\@\!\?]+$/.test(trimmed)) return false;
    // Skip if it looks like an API URL, code or file path
    if (trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.includes('.jsx')) return false;
    return true;
  };

  /**
   * Global DOM Auto-Translation Engine
   * Safely translates visible text nodes in DOM without triggering React re-render loops or MutationObserver loops
   */
  const translateDOMTree = useCallback(async (containerNode = document.body, targetLang = currentLanguage) => {
    if (!containerNode || isTranslatingRef.current) return;

    // Disconnect observer during DOM updates to prevent mutation loops
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // If English, restore all original text nodes
    if (targetLang === 'en-IN') {
      const walker = document.createTreeWalker(containerNode, NodeFilter.SHOW_TEXT, null, false);
      let currentNode;
      while ((currentNode = walker.nextNode())) {
        if (currentNode._origText !== undefined) {
          currentNode.nodeValue = currentNode._origText;
          currentNode._appliedLang = 'en-IN';
        }
      }
      // Re-connect observer
      if (observerRef.current && currentLanguage !== 'en-IN') {
        observerRef.current.observe(document.body, { childList: true, subtree: true, characterData: true });
      }
      return;
    }

    const textNodesToTranslate = [];
    const stringsNeeded = new Set();

    const walker = document.createTreeWalker(
      containerNode,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parentTag = node.parentNode?.tagName?.toLowerCase();
          if (['script', 'style', 'textarea', 'code', 'pre', 'svg'].includes(parentTag)) {
            return NodeFilter.FILTER_REJECT;
          }
          // Ignore Sarvam language dropdown items themselves
          if (node.parentNode?.closest && node.parentNode.closest('[data-no-translate]')) {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip if node has already been translated for targetLang
          if (node._appliedLang === targetLang) {
            return NodeFilter.FILTER_SKIP;
          }
          const textVal = node._origText !== undefined ? node._origText : node.nodeValue;
          if (shouldTranslateText(textVal)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        },
      },
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node._origText === undefined) {
        node._origText = node.nodeValue; // Store original English text
      }
      const rawText = node._origText.trim();
      const cacheKey = `${targetLang}_${rawText}`;

      if (cacheRef.current.has(cacheKey)) {
        // Apply instantly from cache
        const cachedVal = cacheRef.current.get(cacheKey);
        node.nodeValue = cachedVal;
        node._appliedLang = targetLang;
      } else {
        textNodesToTranslate.push(node);
        stringsNeeded.add(rawText);
      }
    }

    if (stringsNeeded.size === 0) {
      // Re-connect observer
      if (observerRef.current && currentLanguage !== 'en-IN') {
        observerRef.current.observe(document.body, { childList: true, subtree: true, characterData: true });
      }
      return;
    }

    // Fetch missing translations in batch from backend Sarvam service
    isTranslatingRef.current = true;

    try {
      const arrayToFetch = Array.from(stringsNeeded);
      const res = await translationService.translateBatch({
        texts: arrayToFetch,
        sourceLanguage: 'en-IN',
        targetLanguage: targetLang,
      });

      const translationsMap = res?.translations || res?.data?.translations || res?.data || {};

      // Populate cache
      Object.entries(translationsMap).forEach(([orig, trans]) => {
        cacheRef.current.set(`${targetLang}_${orig}`, trans);
      });

      // Update DOM nodes safely
      textNodesToTranslate.forEach((tnode) => {
        const origText = tnode._origText.trim();
        const cacheKey = `${targetLang}_${origText}`;
        if (cacheRef.current.has(cacheKey)) {
          tnode.nodeValue = cacheRef.current.get(cacheKey);
          tnode._appliedLang = targetLang;
        }
      });
    } catch (err) {
      console.warn('⚠️ Global Auto-Translation DOM Batch Error:', err);
    } finally {
      isTranslatingRef.current = false;
      // Re-connect observer
      if (observerRef.current && currentLanguage !== 'en-IN') {
        observerRef.current.observe(document.body, { childList: true, subtree: true, characterData: true });
      }
    }
  }, [currentLanguage]);

  // Effect: Run DOM Translation on Language Change and setup MutationObserver
  useEffect(() => {
    // Initial scan — defer to idle time so it doesn't block first paint
    let initialIdleId = null;
    if (typeof requestIdleCallback !== 'undefined') {
      initialIdleId = requestIdleCallback(
        () => translateDOMTree(document.body, currentLanguage),
        { timeout: 2000 }
      );
    } else {
      translateDOMTree(document.body, currentLanguage);
    }

    // Setup MutationObserver to translate newly added nodes dynamically
    if (observerRef.current) observerRef.current.disconnect();

    if (currentLanguage === 'en-IN') {
      return;
    }

    let idleCallbackId = null;
    observerRef.current = new MutationObserver((mutations) => {
      if (isTranslatingRef.current) return;

      let hasNewUnprocessedText = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === Node.TEXT_NODE && addedNode._appliedLang !== currentLanguage) {
              hasNewUnprocessedText = true;
              break;
            } else if (addedNode.nodeType === Node.ELEMENT_NODE) {
              hasNewUnprocessedText = true;
              break;
            }
          }
        }
        if (hasNewUnprocessedText) break;
      }

      if (hasNewUnprocessedText) {
        if (idleCallbackId) cancelIdleCallback(idleCallbackId);
        if (typeof requestIdleCallback !== 'undefined') {
          idleCallbackId = requestIdleCallback(
            () => translateDOMTree(document.body, currentLanguage),
            { timeout: 1500 }
          );
        } else {
          translateDOMTree(document.body, currentLanguage);
        }
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (idleCallbackId && typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(idleCallbackId);
      if (initialIdleId && typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(initialIdleId);
    };
  }, [currentLanguage, translateDOMTree]);

  /**
   * Helper function to translate single string dynamically
   */
  const translate = useCallback(
    async (text, sourceLang = 'en-IN', overrideTargetLang = null) => {
      if (!text || typeof text !== 'string' || !text.trim()) return '';

      const targetLang = overrideTargetLang || currentLanguage;
      if (sourceLang === targetLang) return text;

      const cacheKey = `${targetLang}_${text.trim()}`;
      if (cacheRef.current.has(cacheKey)) {
        return cacheRef.current.get(cacheKey);
      }

      try {
        const res = await translationService.translateText({
          text: text.trim(),
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        });

        const translated = res.translatedText || text;
        cacheRef.current.set(cacheKey, translated);
        return translated;
      } catch (err) {
        console.warn('⚠️ Sarvam Translation Error in LanguageContext:', err);
        return text;
      }
    },
    [currentLanguage]
  );

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        activeLangObj,
        supportedLanguages: SUPPORTED_LANGUAGES,
        setLanguage,
        translate,
        translateDOMTree,
        loadingTranslation,
        translationError,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * Reusable inline React Component for translated text elements
 */
export const Trans = ({ text, children, sourceLang = 'en-IN', fallback = null }) => {
  const { currentLanguage, translate } = useLanguage();
  const rawText = text || (typeof children === 'string' ? children : '');
  const [translatedContent, setTranslatedContent] = useState(rawText);

  useEffect(() => {
    let isMounted = true;
    if (!rawText || sourceLang === currentLanguage) {
      setTranslatedContent(rawText);
      return;
    }

    translate(rawText, sourceLang)
      .then((res) => {
        if (isMounted) setTranslatedContent(res || rawText);
      })
      .catch(() => {
        if (isMounted) setTranslatedContent(rawText);
      });

    return () => {
      isMounted = false;
    };
  }, [rawText, sourceLang, currentLanguage, translate]);

  return <>{translatedContent}</>;
};

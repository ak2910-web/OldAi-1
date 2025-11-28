import { useState, useCallback } from 'react';
import { getResonance } from './api';

/**
 * useResonanceQuery - React hook for querying the backend AI
 * @returns { answer, parsed, tokenCount, cached, loading, error, runQuery }
 */
export function useResonanceQuery() {
  const [answer, setAnswer] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [tokenCount, setTokenCount] = useState(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runQuery = useCallback(async (text, language = 'English') => {
    setLoading(true);
    setError(null);
    setAnswer(null);
    setParsed(null);
    setTokenCount(null);
    setCached(false);
    try {
      const result = await getResonance(text, language);
      setAnswer(result.answer);
      setParsed(result.parsed);
      setTokenCount(result.tokenCount);
      setCached(result.cached);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { answer, parsed, tokenCount, cached, loading, error, runQuery };
}

/**
 * Example usage in a component:
 *
 * const { answer, parsed, loading, error, runQuery } = useResonanceQuery();
 *
 * // To run a query:
 * runQuery('What is Vedic math?', 'English');
 *
 * // Show skeleton loader while loading
 * // Show error message if error
 * // Show answer/parsed when available
 */

// src/App.tsx
import React, { useRef, useState } from 'react';
import { add, NegativeNumberError } from './stringCalculator';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // refs for DOM nodes and to prevent overlapping timers
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const clearAnnounceTimer = useRef<number | null>(null);

  // helper to force re-announcement for the same text by clearing then re-setting quickly
  const announceResult = (value: number) => {
    // if the same value is already shown, clear then re-set so SR announces again
    if (result === value) {
      setResult(null);
      // clear any pending timer first
      if (clearAnnounceTimer.current) {
        window.clearTimeout(clearAnnounceTimer.current);
        clearAnnounceTimer.current = null;
      }
      clearAnnounceTimer.current = window.setTimeout(() => {
        setResult(value);
        clearAnnounceTimer.current = null;
      }, 50);
    } else {
      setResult(value);
    }
  };

  const announceError = (msg: string) => {
    // same approach for errors so repeated identical errors are still announced
    if (error === msg) {
      setError(null);
      if (clearAnnounceTimer.current) {
        window.clearTimeout(clearAnnounceTimer.current);
        clearAnnounceTimer.current = null;
      }
      clearAnnounceTimer.current = window.setTimeout(() => {
        setError(msg);
        clearAnnounceTimer.current = null;
      }, 50);
    } else {
      setError(msg);
    }
  };

  const handleCalculate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Trim and check empty input — if empty, announce and focus textarea
    if (input.trim() === '') {
      setResult(null);
      // set error via announceError so it will re-announce if identical
      announceError('No numbers input. Please enter at least one number.');
      // shift focus to textarea so keyboard and screen-reader users can immediately type
      textareaRef.current?.focus();
      return;
    }

    try {
      const sum = add(input);
      // clear any previous error
      if (error) setError(null);
      // announce result (with forced re-announce if same value)
      announceResult(sum);
    } catch (err: any) {
      setResult(null);
      if (err instanceof NegativeNumberError) {
        announceError(err.message);
      } else if (err instanceof Error) {
        announceError(err.message);
      } else {
        announceError('An unexpected error occurred');
      }
      // when error occurs, move focus to textarea to allow correction (optional but helpful)
      textareaRef.current?.focus();
    }
  };

  return (
    <>
      <style>{`
        .page-root { padding: 20px; background: #ffffff; color: #111111; min-height: 100vh; }
        .visual-stack { display: flex; flex-direction: column; gap: 12px; }
        .visual-image { order: 1; }
        .visual-content { order: 2; }
        .semantic-h1 { order: 2; margin: 0; font-size: 28px; display: block; }
        .semantic-h2 { order: 3; margin: 0; font-size: 18px; color: #222; }
        .sr-only-focusable { position: absolute; left: -10000px; top: auto; width: 1px; height: 1px; overflow: hidden; }
        .sr-only-focusable:focus { position: static; width: auto; height: auto; left: auto; padding: 8px; background: #fff; border: 2px solid #222; z-index: 9999; display: inline-block; }
        .focus-visible { outline: 3px solid #ffbf47; outline-offset: 2px; }
        .btn { padding: 10px 16px; background-color: #0077b6; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .btn:focus { outline: 3px solid #ffbf47; outline-offset: 2px; }
        textarea:focus { outline: 3px solid #ffbf47; outline-offset: 2px; }
        img { max-width: 100%; height: auto; display: block; border-radius: 6px; }
        .instructions { margin-top: 6px; font-size: 13px; color: #333; }
        .result { color: #1b7a00; font-weight: 600; }
        .error { color: #b00020; font-weight: 500; }
      `}</style>

      <a href="#maincontent" className="sr-only-focusable">Skip to main content</a>

      <div className="page-root">
        <h1 className="semantic-h1">String Calculator</h1>

        <div className="visual-stack" aria-hidden={false}>
          <figure className="visual-image" aria-hidden="true" style={{ margin: 0 }}>
            <img
              src="https://images.unsplash.com/photo-1594352161389-11756265d1b5?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              width={600}
              height={400}
              alt=""
            />
          </figure>

          <div className="visual-content">
            <h2 className="semantic-h2">Enter numbers</h2>

            <main id="maincontent" tabIndex={-1}>
              <form
                onSubmit={handleCalculate}
                aria-describedby="instructions"
                noValidate
              >
                <div style={{ margin: '12px 0' }}>
                  <label htmlFor="numbers" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Numbers input
                  </label>
                  <textarea
                    id="numbers"
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter numbers (e.g., 1,2,3 or //; then newline)"
                    rows={6}
                    style={{
                      width: '100%',
                      padding: 10,
                      fontSize: 14,
                      borderRadius: 4,
                      border: '1px solid #ccc',
                      color: '#111',
                    }}
                    onFocus={(e) => e.currentTarget.classList.add('focus-visible')}
                    onBlur={(e) => e.currentTarget.classList.remove('focus-visible')}
                  />
                  <div id="instructions" className="instructions">
                    Separate numbers with commas or newlines. Use <code>//[delim]\n</code> syntax for custom delimiters.
                  </div>
                </div>

                <div style={{ margin: '8px 0' }}>
                  <button
                    type="submit"
                    className="btn"
                    aria-label="Calculate"
                    onFocus={(e) => e.currentTarget.classList.add('focus-visible')}
                    onBlur={(e) => e.currentTarget.classList.remove('focus-visible')}
                  >
                    Calculate
                  </button>
                </div>
              </form>

              {/* Persistent live region for results — updates cause SR announcement.
                  We intentionally clear+re-set result when it's identical to force re-announcement. */}
              <div
                id="calc-result"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                style={{ minHeight: 24, marginTop: 8 }}
              >
                {result !== null ? `Result: ${result}` : ''}
              </div>

              {/* Errors and empty-input messages use role="alert" so they're spoken immediately */}
              {error && (
                <div role="alert" className="error" style={{ marginTop: 12 }}>
                  <p style={{ margin: 0 }}>{error}</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;

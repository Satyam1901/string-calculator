/// <reference types="vitest" />
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { axe } from 'jest-axe';

describe('App accessibility and behavior — final checks', () => {
  it('renders Calculate button and labelled textarea', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /calculate/i });
    expect(button).toBeInTheDocument();

    const textarea = screen.getByLabelText(/numbers input/i);
    expect(textarea).toBeInTheDocument();
  });

  it('does not show an alert by default', () => {
    render(<App />);
    const alert = screen.queryByRole('alert');
    expect(alert).toBeNull();
  });

  it('announces result in aria-live region on calculation', async () => {
    render(<App />);
    const textarea = screen.getByLabelText(/numbers input/i) as HTMLTextAreaElement;
    await userEvent.type(textarea, '1,2,3');
    const button = screen.getByRole('button', { name: /calculate/i });
    await userEvent.click(button);
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/result:\s*6/i);
  });

  it('shows alert and focuses textarea when Calculate pressed with empty input', async () => {
    render(<App />);
    const textarea = screen.getByLabelText(/numbers input/i) as HTMLTextAreaElement;
    await userEvent.clear(textarea);
    const button = screen.getByRole('button', { name: /calculate/i });

    await userEvent.click(button);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/no numbers input/i);
    expect(document.activeElement).toBe(textarea);
  });
  it(
    're-announces identical result when Calculate pressed twice (clear+reset pattern)',
    async () => {
      render(<App />);
      const textarea = screen.getByLabelText(/numbers input/i) as HTMLTextAreaElement;
      await userEvent.type(textarea, '1,2,3');
      const button = screen.getByRole('button', { name: /calculate/i });
      await userEvent.click(button);
      const status1 = await screen.findByRole('status');
      expect(status1).toHaveTextContent(/result:\s*6/i);
      await userEvent.click(button);
      await waitFor(
        async () => {
          const statusAfter = await screen.findByRole('status');
          expect(statusAfter).toHaveTextContent(/result:\s*6/i);
        },
        { timeout: 5000 }
      );
    },
    10000
  );
  it(
    'reports no blocking axe violations (basic scan)',
    async () => {
      const { container } = render(<App />);
      const results = await axe(container);
      expect(results.violations.length).toBe(0);
    },
    10000
  );
});

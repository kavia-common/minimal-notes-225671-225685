import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Retro Notes header", () => {
  render(<App />);
  expect(screen.getByLabelText(/app title/i)).toHaveTextContent(/retro notes/i);
});

test("shows empty state when there are no notes", () => {
  // Ensure no persisted notes affect this test
  window.localStorage.clear();
  render(<App />);
  expect(screen.getByLabelText(/no notes/i)).toBeInTheDocument();
});

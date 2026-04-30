import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";


import { HomePage } from "../../src/pages/Home/HomePage";

describe("Home Page", () => {
  test("correctly renders the game title", () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const heading = screen.getByRole("heading");
    expect(heading.textContent).toEqual("SNIPPIT");
  });

  test("displays the eyeborw and tagline", async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText("Music Timeline Game")).not.toBeNull();
    expect(screen.getByText("Guess the year. Beat your friends.")).not.toBeNull();
  });
});
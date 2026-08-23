## Project Overview

I am designing a web-based board game using the browser DOM, where the game board will always be a perfect square grid with a constant size. Before writing code, I need to map out the technical design.

## Core Constraints & Requirements

* State Management: The DOM will act as the absolute source of truth; I will not be maintaining an in-memory JavaScript array or state object to track tile information. Instead, all game state (e.g., terrain type, unit placement, ownership) will be stored directly on the HTML elements using `data-*` attributes and class names. Updates will happen strictly one cell at a time when clicked.
* Tile Selection Menu: Clicking a cell must open a selection menu to update its state. This menu cannot be text-only; it must support scaled down visual icons representing the different tile types available for selection.

## Design Questions
Based on these parameters, please help me brainstorm the following:

* Data Architecture & DOM Manipulation: What are the best practices for structuring, querying, and updating these stateful `data-*` attributes on a square grid to keep logic clean and performant?
* UI/UX Menu Implementation: Given the hard requirement for visual icons in the selection menu, what is the most effective approach for building a centered dialog box that displays options in a clean list without altering its placement based on where the user clicked.
* Performance: As the square grid scales up (e.g., 20x20), what specific DOM performance bottlenecks (like layout reflows or querying overhead) should I look out for when using the DOM as the primary state store, and how can I mitigate them?

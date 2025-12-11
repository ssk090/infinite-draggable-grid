# GSAP Infinite Draggable Grid

A performant, infinite-scrolling grid built with **React** and **GSAP (GreenSock Animation Platform)**.

## 🚀 Features

*   **Infinite Navigation**: The grid wraps endlessly in all directions.
*   **Momentum Scrolling**: Smooth inertia when you release the drag (powered by `InertiaPlugin`).
*   **Motion Blur**: Dynamic skew and scale effects based on your drag speed.
*   **Fade Edges**: Items smoothly fade out as they reach the screen edges.
*   **Responsive**: Automatically adapts to different screen sizes.

## 🛠️ How it's Made

This project relies on a few key concepts from GSAP to achieve the "infinite" feel without actually rendering infinite items:

1.  **GSAP Draggable**: We don't drag the items directly. We drag an invisible "proxy" element. This gives us precise control over the input values.
2.  **The "Wrap" Logic**: The core magic happens here. We use `gsap.utils.wrap()`.
    *   Imagine the grid is a fixed size (e.g., 2000px wide).
    *   When an item's position goes beyond 2000px, the "wrap" function sends it back to 0.
    *   When it goes below 0, it wraps it to 2000px.
    *   This creates a seamless loop using a fixed number of DOM elements.
3.  **Inertia**: We use the `InertiaPlugin` to add physics to the invisible proxy. When the proxy "glides" after a throw, we update the box positions to match.
4.  **Motion Blur**: content is skewed (`skewX`/`skewY`) based on the velocity (`deltaX`/`deltaY`) of the drag. The faster you move, the more it leans!

## 📦 Installation

1.  Clone the project.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Run the development server:
    ```bash
    pnpm run dev
    ```

## 🧩 Tech Stack

*   [Vite](https://vitejs.dev/) - Fast build tool.
*   [React](https://reactjs.org/) - UI Library.
*   [GSAP](https://greensock.com/) - The animation superpower.

## License

MIT

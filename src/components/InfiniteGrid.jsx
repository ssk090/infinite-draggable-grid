
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(Draggable, InertiaPlugin, useGSAP);

const gridConfig = {
    boxSize: 200,
    gap: 50,
    numCols: 15, // Large enough to cover wide screens
    numRows: 10, // Large enough to cover tall screens
};
const totalItems = gridConfig.numCols * gridConfig.numRows;
const items = Array.from({ length: totalItems }, (_, i) => i + 1);

const InfiniteGrid = () => {
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);

    useGSAP(() => {
        const wrapper = wrapperRef.current;
        const container = containerRef.current;
        const boxes = gsap.utils.toArray(".grid-item");

        const boxWidth = gridConfig.boxSize + gridConfig.gap;
        const boxHeight = gridConfig.boxSize + gridConfig.gap;

        const gridWidth = gridConfig.numCols * boxWidth;
        const gridHeight = gridConfig.numRows * boxHeight;

        gsap.set(container, { width: gridWidth, height: gridHeight });

        // Initial Position
        boxes.forEach((box, i) => {
            const col = i % gridConfig.numCols;
            const row = Math.floor(i / gridConfig.numCols);

            gsap.set(box, {
                x: col * boxWidth,
                y: row * boxHeight,
                width: gridConfig.boxSize,
                height: gridConfig.boxSize,
                position: "absolute"
            });
        });

        const proxy = document.createElement("div");

        Draggable.create(proxy, {
            trigger: wrapper,
            type: "x,y",
            inertia: true,
            onDrag: updateProgress,
            onThrowUpdate: updateProgress
        });

        // Wrap logic: range must be exactly gridWidth/gridHeight
        // Centering the range allows items to wrap to the left/top of the viewport
        const wrapX = gsap.utils.wrap(-gridWidth / 2, gridWidth / 2);
        const wrapY = gsap.utils.wrap(-gridHeight / 2, gridHeight / 2);

        function updateProgress() {
            const dragX = this.x;
            const dragY = this.y;

            boxes.forEach((box, i) => {
                const col = i % gridConfig.numCols;
                const row = Math.floor(i / gridConfig.numCols);

                const xPos = col * boxWidth;
                const yPos = row * boxHeight;

                const x = wrapX(xPos + dragX);
                const y = wrapY(yPos + dragY);

                // Fade out logic
                // Calculate distance from center of screen
                const boxCenter = {
                    x: x + gridConfig.boxSize / 2,
                    y: y + gridConfig.boxSize / 2
                };
                const screenCenter = {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2
                };

                // Distance from center
                const dx = Math.abs(boxCenter.x - screenCenter.x);
                const dy = Math.abs(boxCenter.y - screenCenter.y);

                // Define visible boundaries
                // Start fading much earlier to make it "more visible"
                // e.g., only keep the center 40% fully opaque
                const xThreshold = window.innerWidth / 2;
                const yThreshold = window.innerHeight / 2;

                // Fade starts at 30% of screen dimension from center, ends at edge
                const fadeStartX = xThreshold * 0.3;
                const fadeEndX = xThreshold * 0.9;

                const fadeStartY = yThreshold * 0.3;
                const fadeEndY = yThreshold * 0.9;

                const opacityX = gsap.utils.mapRange(fadeStartX, fadeEndX, 1, 0.4, dx);
                const opacityY = gsap.utils.mapRange(fadeStartY, fadeEndY, 1, 0.4, dy);

                // Use min instead of multiply to avoid double-fading corners
                // Motion Blur / Skew Effect
                // Use delta since last frame to estimate velocity
                // Clamp skew to prevent extreme distortion
                // Note: dragX - this.x is 0 because this.x IS dragX in this frame.
                // We need velocity from tracker or delta.
                // Draggable provides deltaX/deltaY in the instance.

                const velocityX = this.deltaX;
                const velocityY = this.deltaY;

                // Apply subtle scale/skew based on velocity
                const stretchX = Math.abs(velocityX) * 0.005;
                const stretchY = Math.abs(velocityY) * 0.005;

                // We can use scale to "stretch" in direction of movement
                // Or skew. Skew feels more "fast".

                const opacity = gsap.utils.clamp(0.4, 1, Math.min(opacityX, opacityY));

                gsap.set(box, {
                    x,
                    y,
                    opacity,
                    skewX: velocityX * 0.2, // Reduced sensitivity
                    skewY: velocityY * 0.2,
                    scaleX: 1 + stretchX,
                    scaleY: 1 + stretchY
                });
            });
        }

    }, { scope: wrapperRef });

    return (
        <div ref={wrapperRef} className="wrapper" style={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative',
            background: '#111'
        }}>
            <div ref={containerRef} className="container" style={{ position: 'relative' }}>
                {items.map((item) => (
                    <div key={item} className="grid-item" style={{
                        backgroundColor: `hsl(${(item * 13) % 360}, 70%, 50%)`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'rgba(255,255,255,0.8)',
                        userSelect: 'none',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InfiniteGrid;

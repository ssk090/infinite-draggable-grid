
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(Draggable, InertiaPlugin, useGSAP, Observer);

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

        const draggable = Draggable.create(proxy, {
            trigger: wrapper,
            type: "x,y",
            inertia: true,
            onDrag: function () { updateProgress(this.x, this.y, this.deltaX, this.deltaY) },
            onThrowUpdate: function () { updateProgress(this.x, this.y, this.deltaX, this.deltaY) }
        })[0];

        // Connect wheel/touch scaling to the draggable proxy
        Observer.create({
            target: wrapper,
            type: "wheel,touch",
            onChange: (self) => {
                // Get the current proxy position
                const currentX = gsap.getProperty(proxy, "x");
                const currentY = gsap.getProperty(proxy, "y");

                // Update proxy position based on scroll delta
                // Invert deltaY for natural scroll feel usually, but depends on preference.
                // Standard scroll: Wheel Down (positive delta) -> Content moves Up (negative Y)
                const newX = currentX - self.deltaX;
                const newY = currentY - self.deltaY;

                // Apply change to proxy immediately so draggable tracks it
                gsap.set(proxy, { x: newX, y: newY });

                // Important: Update Draggable's internal recording so inertia works correctly if you throw after scrolling
                draggable.update();

                // Manually calculating delta for blur
                const vX = -self.deltaX;
                const vY = -self.deltaY;

                updateProgress(newX, newY, vX, vY);
            }
        });

        // Wrap logic: range must be exactly gridWidth/gridHeight
        // Centering the range allows items to wrap to the left/top of the viewport
        const wrapX = gsap.utils.wrap(-gridWidth / 2, gridWidth / 2);
        const wrapY = gsap.utils.wrap(-gridHeight / 2, gridHeight / 2);

        function updateProgress(x, y, vX, vY) {
            const dragX = x;
            const dragY = y;

            const velocityX = vX;
            const velocityY = vY;

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
                const xThreshold = window.innerWidth / 2;
                const yThreshold = window.innerHeight / 2;

                const fadeStartX = xThreshold * 0.3;
                const fadeEndX = xThreshold * 0.9;

                const fadeStartY = yThreshold * 0.3;
                const fadeEndY = yThreshold * 0.9;

                const opacityX = gsap.utils.mapRange(fadeStartX, fadeEndX, 1, 0.4, dx);
                const opacityY = gsap.utils.mapRange(fadeStartY, fadeEndY, 1, 0.4, dy);

                // Use min instead of multiply to avoid double-fading corners
                const opacity = gsap.utils.clamp(0.4, 1, Math.min(opacityX, opacityY));

                // Apply subtle scale/skew based on velocity
                const stretchX = Math.abs(velocityX) * 0.005;
                const stretchY = Math.abs(velocityY) * 0.005;

                gsap.set(box, {
                    x,
                    y,
                    opacity,
                    skewX: velocityX * 0.2,
                    skewY: velocityY * 0.2,
                    scaleX: 1 + stretchX,
                    scaleY: 1 + stretchY
                });
            });
        }

        // Initial setup
        updateProgress(0, 0, 0, 0);

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

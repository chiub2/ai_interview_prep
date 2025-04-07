// AnimatedBackground.tsx - Component for creating animated background effects
// This component creates an asymmetric animated background with concentrated effects on the right

'use client';
import { motion } from 'framer-motion';  // Import Framer Motion
import { useEffect, useState } from 'react';  // Import React hooks

// Define the tile type
interface Tile {
    x: number;
    y: number;
    delay: number;
    isRightSide: boolean;  // Flag for right-side tiles
}

// Main AnimatedBackground component
const AnimatedBackground = () => {
    const [tiles, setTiles] = useState<Tile[]>([]);  // Store tile data
    const tileSize = 24;  // Slightly larger tiles for better performance
    const rightSideThreshold = 0.6;  // 60% of screen width marks the right side

    // Initialize tiles
    useEffect(() => {
        const generateTiles = () => {
            const newTiles: Tile[] = [];
            const columns = Math.ceil(window.innerWidth / tileSize);
            const rows = Math.ceil(window.innerHeight / tileSize);

            // Calculate focal point for the right side animation
            const focalX = columns * 0.8;  // Focal point at 80% of width
            const focalY = rows * 0.5;     // Center vertically

            for (let x = 0; x < columns; x++) {
                for (let y = 0; y < rows; y++) {
                    // Determine if this tile is on the right side
                    const isRightSide = x / columns > rightSideThreshold;

                    // Calculate distance from focal point (for right side tiles)
                    const distance = Math.sqrt(
                        Math.pow(x - focalX, 2) + 
                        Math.pow(y - focalY, 2)
                    );

                    // Add tile with lower probability for left side
                    if (isRightSide || Math.random() < 0.15) {  // Only 15% of left side tiles
                        newTiles.push({
                            x: x * tileSize,
                            y: y * tileSize,
                            delay: distance * 0.1,
                            isRightSide
                        });
                    }
                }
            }
            setTiles(newTiles);
        };

        generateTiles();
        window.addEventListener('resize', generateTiles);

        return () => window.removeEventListener('resize', generateTiles);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#0a0f0d] overflow-hidden">
            {tiles.map((tile, index) => (
                <motion.div
                    key={index}
                    className="absolute rounded-sm"
                    style={{
                        left: tile.x,
                        top: tile.y,
                        width: tileSize - 2,  // Slight gap between tiles
                        height: tileSize - 2,
                        backgroundColor: '#1a3b23',  // Dark green base color
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={tile.isRightSide ? {
                        // Right side animation: more active
                        opacity: [0, 0.8, 0.4],
                        scale: [0.8, 1, 0.9],
                        backgroundColor: [
                            '#1a3b23',    // Dark green
                            '#2ecc71',    // Bright green
                            '#1a3b23'     // Back to dark
                        ]
                    } : {
                        // Left side animation: more subtle
                        opacity: [0, 0.3, 0],
                        scale: [0.9, 1, 0.9],
                        backgroundColor: [
                            '#1a3b23',    // Dark green
                            '#1f4f2e',    // Slightly lighter green
                            '#1a3b23'     // Back to dark
                        ]
                    }}
                    transition={{
                        duration: tile.isRightSide ? 3 : 4,
                        delay: tile.isRightSide ? tile.delay : Math.random() * 10,
                        repeat: Infinity,
                        repeatDelay: tile.isRightSide ? 
                            Math.random() * 4 + 2 :    // Shorter delays for right side
                            Math.random() * 10 + 5,    // Longer delays for left side
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

export default AnimatedBackground; 
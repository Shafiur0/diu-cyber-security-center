'use client';

import React, { useEffect, useRef } from 'react';

export default function ThreatPulseGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracker
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 150,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrid();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Grid details
    interface Node {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      pulseVal: number;
      pulseSpeed: number;
    }

    let nodes: Node[] = [];
    const hexRadius = 45; // size of hexagons

    const initGrid = () => {
      nodes = [];
      // Layout nodes in a hexagonal honeycomb structure
      const horizontalSpacing = hexRadius * 1.5;
      const verticalSpacing = hexRadius * Math.sqrt(3);

      const cols = Math.ceil(width / horizontalSpacing) + 2;
      const rows = Math.ceil(height / verticalSpacing) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          let x = col * horizontalSpacing;
          let y = row * verticalSpacing;

          // Offset every alternate column to form hex grid structure
          if (col % 2 === 1) {
            y += verticalSpacing / 2;
          }

          nodes.push({
            x,
            y,
            targetX: x,
            targetY: y,
            pulseVal: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03,
          });
        }
      }
    };

    initGrid();

    // Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background cyber lines (faint grid)
      ctx.strokeStyle = 'rgba(255, 75, 75, 0.02)';
      ctx.lineWidth = 1;

      // Update node positions based on mouse repulsion
      nodes.forEach((node) => {
        const dx = mouse.x - node.targetX;
        const dy = mouse.y - node.targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          // Push node away from mouse
          const pushX = Math.cos(angle) * force * 15;
          const pushY = Math.sin(angle) * force * 15;
          node.x += (node.targetX - pushX - node.x) * 0.1;
          node.y += (node.targetY - pushY - node.y) * 0.1;
        } else {
          // Spring back to target position
          node.x += (node.targetX - node.x) * 0.1;
          node.y += (node.targetY - node.y) * 0.1;
        }

        node.pulseVal += node.pulseSpeed;
      });

      // Draw lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];

        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect nodes that are close to each other (about hex distance)
          if (dist < hexRadius * 1.8) {
            // Determine line opacity based on mouse distance
            const mDx = mouse.x - (nodeA.x + nodeB.x) / 2;
            const mDy = mouse.y - (nodeA.y + nodeB.y) / 2;
            const mDist = Math.sqrt(mDx * mDx + mDy * mDy);

            let opacity = 0.05;
            let width = 0.8;

            if (mDist < mouse.radius) {
              const hoverFactor = 1 - mDist / mouse.radius;
              opacity = 0.05 + hoverFactor * 0.45;
              width = 0.8 + hoverFactor * 1.5;
            }

            // Pulsing factor
            const pulse = (Math.sin((nodeA.pulseVal + nodeB.pulseVal) / 2) + 1) / 2;
            const currentOpacity = opacity * (0.3 + pulse * 0.7);

            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(255, 75, 75, ${currentOpacity})`;
            ctx.lineWidth = width;
            ctx.stroke();
          }
        }
      }

      // Draw node dots
      nodes.forEach((node) => {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let radius = 2.5;
        let color = 'rgba(255, 255, 255, 0.1)';

        if (dist < mouse.radius) {
          const hoverFactor = 1 - dist / mouse.radius;
          radius = 2.5 + hoverFactor * 2;
          color = `rgba(255, 75, 75, ${0.1 + hoverFactor * 0.9})`;
        } else {
          // Standard pulsing node
          const pulse = (Math.sin(node.pulseVal) + 1) / 2;
          color = `rgba(255, 75, 75, ${0.05 + pulse * 0.15})`;
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

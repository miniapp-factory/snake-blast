"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function getRandomTile() {
  return Math.random() < TILE_PROBABILITIES[0] ? 2 : 4;
}

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

export default function Game() {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // Add initial tiles
  useEffect(() => {
    const newGrid = createEmptyGrid();
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid(newGrid);
  }, []);

  function addRandomTile(g: number[][]) {
    const empty: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    g[r][c] = getRandomTile();
  }

  function slideAndMerge(row: number[]) {
    const filtered = row.filter((v) => v !== 0);
    const merged: number[] = [];
    let skip = false;
    for (let i = 0; i < filtered.length; i++) {
      if (skip) {
        skip = false;
        continue;
      }
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        merged.push(filtered[i] * 2);
        setScore((s) => s + filtered[i] * 2);
        skip = true;
      } else {
        merged.push(filtered[i]);
      }
    }
    while (merged.length < GRID_SIZE) merged.push(0);
    return merged;
  }

  function move(direction: "up" | "down" | "left" | "right") {
    if (gameOver) return;
    let newGrid = createEmptyGrid();
    let changed = false;

    if (direction === "left" || direction === "right") {
      for (let r = 0; r < GRID_SIZE; r++) {
        let row = grid[r];
        if (direction === "right") row = [...row].reverse();
        const merged = slideAndMerge(row);
        if (direction === "right") merged.reverse();
        newGrid[r] = merged;
        if (!changed && merged.some((v, i) => v !== grid[r][i])) changed = true;
      }
    } else {
      for (let c = 0; c < GRID_SIZE; c++) {
        let col = grid.map((row) => row[c]);
        if (direction === "down") col = [...col].reverse();
        const merged = slideAndMerge(col);
        if (direction === "down") merged.reverse();
        for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = merged[r];
        if (!changed && merged.some((v, i) => v !== grid[i][c])) changed = true;
      }
    }

    if (!changed) return;

    addRandomTile(newGrid);
    setGrid(newGrid);

    // Check win
    if (newGrid.some((row) => row.includes(2048))) setWon(true);

    // Check game over
    const hasEmpty = newGrid.some((row) => row.includes(0));
    const canMerge = newGrid.some((r, i) =>
      newGrid[r].some((v, j) => {
        if (v === 0) return false;
        if (i + 1 < GRID_SIZE && newGrid[i + 1][j] === v) return true;
        if (j + 1 < GRID_SIZE && newGrid[i][j + 1] === v) return true;
        return false;
      })
    );
    if (!hasEmpty && !canMerge) setGameOver(true);
  }

  const arrowButtons = [
    { dir: "up", label: "↑" },
    { dir: "left", label: "←" },
    { dir: "right", label: "→" },
    { dir: "down", label: "↓" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-1">
        {grid.flat().map((v, idx) => (
          <div
            key={idx}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-md border",
              v === 0
                ? "bg-muted"
                : v < 16
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {v !== 0 && <span className="text-lg font-bold">{v}</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => move("up")}
            className="w-12 h-12"
          >
            ↑
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            onClick={() => move("left")}
            className="w-12 h-12"
          >
            ←
          </Button>
          <Button
            variant="outline"
            onClick={() => move("right")}
            className="w-12 h-12"
          >
            →
          </Button>
        </div>
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => move("down")}
            className="w-12 h-12"
          >
            ↓
          </Button>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg">Score: {score}</p>
        {won && <p className="text-green-600 font-bold">You won!</p>}
        {gameOver && <p className="text-red-600 font-bold">Game Over</p>}
      </div>
    </div>
  );
}

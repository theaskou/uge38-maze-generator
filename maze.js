function randomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walls = {
      top: true,
      right: true,
      bottom: true,
      left: true,
    };
    this.visited = false;
    this.item = null;
  }

  draw(ctx, cellWidth) {
    const px = this.x * cellWidth;
    const py = this.y * cellWidth;

    ctx.fillStyle = "#f7cd8b";
    ctx.fillRect(px, py, cellWidth, cellWidth);
    ctx.strokeStyle = "#472119";
    ctx.lineWidth = 4;
    ctx.beginPath();

    if (this.item) {
      ctx.font = `${cellWidth / 2}px serif`;
      ctx.fillText(
        this.item,
        px + cellWidth / 4,
        py + cellWidth / 1.5,
        cellWidth
      );
    }

    ctx.moveTo(px, py);

    if (this.walls.left) {
      ctx.lineTo(px, py + cellWidth);
    } else {
      ctx.moveTo(px, py + cellWidth);
    }

    if (this.walls.bottom) {
      ctx.lineTo(px + cellWidth, py + cellWidth);
    } else {
      ctx.moveTo(px + cellWidth, py + cellWidth);
    }

    if (this.walls.right) {
      ctx.lineTo(px + cellWidth, py);
    } else {
      ctx.moveTo(px + cellWidth, py);
    }

    if (this.walls.top) {
      ctx.lineTo(px, py);
    } else {
      ctx.moveTo(px, py);
    }

    ctx.stroke();
  }

  // find naboerne i grid vha. this.x og this.y
  unvisitedNeighbors(grid) {
    let neighbors = [];

    // Vi er ikke den nordligste celle
    if (this.y > 0) {
      const nord_x = this.x;
      const nord_y = this.y - 1;
      const nord_nabo = grid[nord_x][nord_y];
      if (!nord_nabo.visited) {
        neighbors.push(nord_nabo);
      }
    }

    // Vi er ikke cellen mest til venstre
    if (this.x > 0) {
      const venstre_x = this.x - 1;
      const venstre_y = this.y;
      const venstre_nabo = grid[venstre_x][venstre_y];
      if (!venstre_nabo.visited) {
        neighbors.push(venstre_nabo);
      }
    }

    // Vi er ikke den sydligste celle
    if (this.y < grid[0].length - 1) {
      const syd_x = this.x;
      const syd_y = this.y + 1;
      const syd_nabo = grid[syd_x][syd_y];
      if (!syd_nabo.visited) {
        neighbors.push(syd_nabo);
      }
    }

    // Vi er ikke cellen mest til højre
    if (this.x < grid.length - 1) {
      const højre_x = this.x + 1;
      const højre_y = this.y;
      const højre_nabo = grid[højre_x][højre_y];
      if (!højre_nabo.visited) {
        neighbors.push(højre_nabo);
      }
    }

    return neighbors;
  }

  punchWallDown(otherCell) {
    const dx = this.x - otherCell.x;
    const dy = this.y - otherCell.y;

    if (dx === 1) {
      // otherCell er til venstre for this
      this.walls.left = false;
      otherCell.walls.right = false;
    } else if (dx === -1) {
      // otherCell er til højre for this
      this.walls.right = false;
      otherCell.walls.left = false;
    } else if (dy === 1) {
      // otherCell er over this
      this.walls.top = false;
      otherCell.walls.bottom = false;
    } else if (dy === -1) {
      // otherCell er under this
      this.walls.bottom = false;
      otherCell.walls.top = false;
    }
  }
}

class Maze {
  constructor(cols, rows, canvas) {
    this.grid = [];
    this.cols = cols;
    this.rows = rows;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cellWidth = canvas.width / cols;
    this.initializeGrid();
  }

  initializeGrid() {
    for (let i = 0; i < this.rows; i += 1) {
      this.grid.push([]);
      for (let j = 0; j < this.cols; j += 1) {
        this.grid[i].push(new Cell(i, j));
      }
    }
  }

  draw() {
    for (let i = 0; i < this.rows; i += 1) {
      for (let j = 0; j < this.cols; j += 1) {
        this.grid[i][j].draw(this.ctx, this.cellWidth);
      }
    }
  }

  generate() {
    const start_x = randomInteger(0, this.cols);
    const start_y = randomInteger(0, this.rows);
    let currentCell = this.grid[start_x][start_y];
    let stack = [];

    currentCell.visited = true;

    // Get unvisited neighbors
    // If there are unvisited neighbors:
    // - pick a random one of them
    // - carve a hole through the wall
    // - push current cell on stack
    // - make that neighbor the current cell
    // If not, make the top of stack the current cell
    // If still not, you're done

    while (currentCell != null) {
      let unvisitedNeighbors = currentCell.unvisitedNeighbors(this.grid);
      if (unvisitedNeighbors.length > 0) {
        const randomNeighborCell =
          unvisitedNeighbors[randomInteger(0, unvisitedNeighbors.length)];
        currentCell.punchWallDown(randomNeighborCell);
        stack.push(currentCell);
        currentCell = randomNeighborCell;
        currentCell.visited = true;
      } else {
        if (Math.random() < 0.25) {
          currentCell = stack.splice(randomInteger(0, stack.length), 1)[0];
        } else {
          currentCell = stack.pop();
        }
      }
    }
  }

  addItems(items) {
    if (!items) {
      return;
    }
    const deadEnds = [];
    for (let x = 0; x < this.rows; x++) {
      for (let y = 0; y < this.cols; y++) {
        const currentCell = this.grid[x][y];
        const walls = Object.values(currentCell.walls);
        const filteredWalls = walls.filter((wall) => wall);
        if (filteredWalls.length === 3) {
          deadEnds.push(currentCell);
        }
      }
    }
    items.forEach((item) => {
      const randomDeadEnd = deadEnds.splice(
        randomInteger(0, deadEnds.length),
        1
      )[0];
      randomDeadEnd.item = item;
    });
    console.log(this.grid);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const maze = new Maze(20, 20, canvas);

  maze.generate();
  maze.addItems(["💰", "🗝️", "🐉", "🪿"]);
  maze.draw();

  console.log(maze);
});

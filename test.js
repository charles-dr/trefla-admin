function checkFootprintExists(footprints = [], { x, y}) {
  const [exists] = footprints.filter((footprint) => (footprint.x === x) && (footprint.y === y));
  return !!exists;
}

function minTime(grid, position, footprints = []) {
  // if (footprints.length > 1000) return -1;
  // console.log('[history]', footprints, position);
  const xMax = grid[0].length - 1;
  const yMax = grid.length - 1;
  const { x, y } = position;

  if (x < 0 || x > xMax || y < 0 || y > yMax) return -1;
  // when point is closed.
  if (grid[y][x] === '#') return -1;   
  // when point is in the history.
  // if (checkFootprintExists(footprints, position)) return -1; 
  // terminate recursive calling.
  if (x === xMax && y === yMax) {
    // console.log('[Solved]', footprints, footprints.length);
    return footprints.length - 1;
  }
  // footprints.push(position);
  
  let nextPoints = [
      {x: x - 1, y}, // LEFT
      {x, y: y - 1}, // UP
      {x: x + 1, y}, // RIGHT
      {x, y: y + 1}, // DOWN
  ];
  // console.log('[4 Nexts]', nextPoints);
  nextPoints = nextPoints.filter((point) => !checkFootprintExists(footprints, point)); //console.log('[First filter]', nextPoints);
  nextPoints = nextPoints.filter((point) => (point.x >= 0 && point.x <= xMax && point.y >= 0 && point.y <= yMax )); //console.log('[Second filter]', nextPoints);
  // console.log('[next points]', footprints, nextPoints);

  let values = nextPoints.map(point => minTime(grid, point, [...footprints, point])); //console.log('[Values]1', values);
  values = values.filter(time => time > 0); //console.log('[Values]2', values);
  const minT = values.length === 0 ? -1 : Math.min(...values);
  // console.log('[Solved]', footprints, minT);
  return minT;
  // const minT = Math.min(nextPoints.map((point) => minTime(grid, point, [...footprints, point])).filter((time) => time > 0));
  // console.log('[Recursive][minT]', footprints, minT);
  // return isNaN(minT) || minT === 0 ? -1 : minT;
}

function reachTheEnd(grid, maxTime) {
  // Write your code here
  if (!grid || grid.length === 0) return 'No';
  const minT = minTime(grid, {x: 0, y: 0}, [{x: 0, y: 0}]);
  console.log('[minT]', minT);
  return minT > 0 && minT <= maxTime ? 'Yes' : 'No';
}

const res = reachTheEnd([
  ".....##.###.#...#.#.",
  "####.#.#.###.######.",
  "####...#......##..##",
  ".#.##.....#........#",
  "####.##....#.#.#.#.#",
  "...#...###.##.##...#",
  "###....#.#.#.#.#.#..",
  ".##..#.#.##..#.####.",
  "..###....#.##.#.....",
  "#.#.....#.......###."
], 1000);
console.log('[res]', res);
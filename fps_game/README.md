# README.md - Mobile FPS Game

A mobile-friendly first-person shooter game similar to Dusk or Quake with smooth performance and secret areas.

## Features

- **Mobile Optimized**: Touch controls and performance optimizations for mobile devices
- **7 Versatile Weapons**: Pistol, Shotgun, Assault Rifle, Sniper Rifle, Rocket Launcher, Plasma Gun, and BFG
- **Multiple Levels**: 5 unique levels with different environments and challenges
- **Secret Areas**: Hidden passages and collectibles to discover
- **Smooth Performance**: Adaptive quality settings for consistent framerate
- **Browser Compatible**: Runs in any modern browser without plugins

## Technologies Used

- **Babylon.js**: 3D rendering engine
- **Webpack**: Module bundling
- **JavaScript**: Core game logic
- **HTML5/CSS3**: UI and styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Development

Run the development server:
```
npm start
```

This will start a local development server at http://localhost:8080

### Building for Production

Build the production bundle:
```
npm run build
```

The built files will be in the `dist` directory.

## Controls

### Desktop:
- **WASD**: Movement
- **Mouse**: Look around
- **Left Click**: Shoot
- **Space**: Jump
- **1-7**: Switch weapons
- **R**: Reload
- **Esc**: Pause menu

### Mobile:
- **Left virtual joystick**: Movement
- **Right side of screen**: Look around
- **Fire button**: Shoot
- **Jump button**: Jump
- **Weapon buttons**: Switch weapons
- **Reload button**: Reload
- **Double-tap right side**: Toggle aim mode

## Game Structure

- `src/`: Source code
  - `game.js`: Main game class
  - `index.js`: Entry point
  - `weapons/`: Weapon system
  - `levels/`: Level system
  - `enemies/`: Enemy AI
  - `optimization/`: Mobile optimizations
- `assets/`: Game assets
  - `textures/`: Texture files
  - `models/`: 3D models
  - `sounds/`: Audio files

## Adding New Levels

See the DEPLOYMENT.md file for instructions on adding new levels.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Browser FPS Game - Deployment Guide

This document provides instructions for deploying and playing the browser-based FPS game.

## Building the Game

To build the game for production:

1. Make sure you have Node.js installed (v14 or higher recommended)
2. Install dependencies:
   ```
   npm install
   ```
3. Build the production bundle:
   ```
   npm run build
   ```
4. The built files will be in the `dist` directory

## Deployment Options

### Option 1: Local Testing

To test the game locally:
1. After building, open the `dist/index.html` file in a browser
2. Or use a local server like `http-server`:
   ```
   npx http-server dist
   ```

### Option 2: Web Hosting

To deploy to a web server:
1. Upload the contents of the `dist` directory to your web hosting service
2. Make sure the server is configured to serve static files
3. The game should be accessible at your domain

### Option 3: GitHub Pages

To deploy using GitHub Pages:
1. Push the `dist` directory to a GitHub repository
2. Enable GitHub Pages in the repository settings
3. Set the source to the branch containing your `dist` directory

## Browser Compatibility

The game has been tested and confirmed to work on:
- Chrome (desktop and mobile)
- Firefox (desktop and mobile)
- Safari (desktop and mobile)
- Edge (desktop)

## Mobile Device Requirements

For optimal mobile performance:
- Modern smartphone or tablet (less than 3-4 years old)
- Updated browser version
- At least 2GB of RAM
- Stable internet connection

## Controls

### Desktop:
- WASD: Movement
- Mouse: Look around
- Left Click: Shoot
- Space: Jump
- 1-7: Switch weapons
- R: Reload
- Esc: Pause menu

### Mobile:
- Left virtual joystick: Movement
- Right side of screen: Look around
- Fire button: Shoot
- Jump button: Jump
- Weapon buttons: Switch weapons
- Reload button: Reload
- Double-tap right side: Toggle aim mode

## Adding New Levels

To add new levels to the game:
1. Create a new level file in `src/levels/`
2. Register the level in the `LevelManager.js` file
3. Add any necessary assets to the assets directory
4. Rebuild the game

## Performance Optimization

If experiencing performance issues:
1. Lower the quality settings in the game menu
2. Close other browser tabs and applications
3. Make sure your device meets the minimum requirements
4. Try a different browser if problems persist

## Troubleshooting

Common issues and solutions:
- Game doesn't load: Check browser console for errors, ensure all assets are properly loaded
- Controls not working: Make sure the game canvas has focus, try clicking on it
- Performance issues: Lower quality settings, close other applications
- Mobile controls not appearing: Make sure you're on a touch-enabled device, try refreshing

## License

This game is distributed under the MIT License. See LICENSE file for details.

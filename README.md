# Virtual Museum - Vite Edition

A virtual 3D museum experience built with Three.js and Vite, featuring both standard and cel-shaded rendering options.

## Features

- 3D environment with artwork displays
- First-person navigation with WASD/arrow keys
- Jumping with the spacebar
- Movement visualization and speed indicator
- Smooth acceleration and deceleration
- Interactive artwork information display
- **NEW:** Cel-shaded rendering with bold outlines and visual effects

## New Visual Effects

The museum now includes several visual effects options that can be toggled on/off:

### Cel-Shading Features

- **Cel-Shading:** Toggle with "C" key - Creates a black-and-white architectural rendering style
- **Outlines:** Toggle with "O" key - Adds bold black outlines to objects in the scene
- **Noise Filter:** Toggle with "N" key - Applies a stippled/noise shading effect for added texture
- **Anaglyph 3D:** Toggle with "T" key - Creates a red-blue stereoscopic effect for visual depth

These effects can be used in combination (although anaglyph mode has some limitations with other effects).

## Development Setup

1. **Install dependencies**

```bash
npm install
```

2. **Start the development server**

```bash
npm run dev
```

3. **Build for production**

```bash
npm run build
```

4. **Preview the production build**

```bash
npm run preview
```

## Controls

- **W/Up Arrow**: Move forward
- **S/Down Arrow**: Move backward
- **A/Left Arrow**: Move left
- **D/Right Arrow**: Move right
- **Space**: Jump
- **Mouse**: Look around
- **ESC**: Release mouse control

### Visual Effect Controls
- **C**: Toggle cel-shading effect
- **O**: Toggle outline effect
- **N**: Toggle noise/stipple effect
- **T**: Toggle anaglyph 3D effect

## Testing

The project includes automated tests for the cel-shading features. The tests verify:

- Correct toggling of cel-shaded materials
- Proper functioning of all visual effects
- Correct rendering paths based on active effects
- Integration of multiple effects

To run the tests:

```bash
npm test
```

## Technologies Used

- Three.js - 3D graphics library
- EffectComposer - Post-processing pipeline
- OutlinePass - Bold edge rendering
- AnaglyphEffect - Red-blue stereoscopic effect
- Custom Shaders - For stippled rendering
- Vite - Fast modern build tool
- Vanilla JavaScript - Core programming 
# Virtual Museum

An interactive 3D virtual museum where users can walk around and view artwork, similar to a real museum experience.

## Features

- First-person navigation through a virtual museum space
- View famous artwork displays with information
- Interactive elements that provide details about each artwork
- Realistic 3D environment with proper lighting and shadows

## How to Use

1. Open the `index.html` file in a web browser (Chrome or Firefox recommended for best performance)
2. Click anywhere on the screen to start the interactive experience
3. Use the following controls to navigate:
   - **W / Arrow Up**: Move forward
   - **S / Arrow Down**: Move backward
   - **A / Arrow Left**: Move left
   - **D / Arrow Right**: Move right
   - **Mouse**: Look around
   - **ESC**: Release mouse control
4. Click on artworks to view information about them

## Technical Details

This project is built using:
- Three.js for 3D rendering
- Pointer Lock controls for first-person navigation
- Responsive design that works on most modern browsers

## Setup

No build process is required. Simply clone this repository and open `index.html` in a browser. 

You can also serve it using a simple HTTP server for better performance:

```bash
# Using Python
python -m http.server

# Using Node.js
npx serve
```

Then navigate to `http://localhost:8000` (Python) or `http://localhost:3000` (Node).

## Running Online

You can access a live version of this virtual museum at: https://marx-a00.github.io/virtual-museum/

## Future Enhancements

- Add more artworks and museum sections
- Implement audio guides
- Add more interactive elements and animations
- Support for VR devices

## Credits

The artwork images used in this project are in the public domain or used under appropriate licenses. Original artwork credit belongs to the respective artists.
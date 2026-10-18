# Student Portfolio Website

A responsive three-page portfolio built with HTML, CSS, JavaScript, and Three.js.

## Pages
- `index.html` — profile, editable personal details, and drag-and-drop profile photo.
- `projects.html` — project cards and interactive 3D model viewer.
- `contact.html` — technical skills, languages known with proficiency levels, current learning goals, and contact links.

## Edit your details
Open `js/profile.js`. Replace the example name, college, course, education dates, phone, email, summary, experience, skills, languages and proficiency levels, learning list, and GitHub URL. This data is shared across the pages.

Replace project titles and descriptions directly in `projects.html`.

## Run the portfolio and 3D viewer (Windows)

**Use the launcher instead of double-clicking `index.html`.** Browsers do not allow an HTML page opened with `file://` to start a local server itself. The one-click launcher starts the local server and then opens the portfolio home page, so you can click **Projects & 3D Viewer** and load models.

1. Extract the ZIP into a folder.
2. Double-click `START_PORTFOLIO.bat` (or `RUN_PORTFOLIO_LOCAL.bat`).
3. A command window starts the server and opens `index.html` in your browser.
4. Use the navigation bar to open **Projects & 3D Viewer**, then click **Choose 3D file** or drop a model into the viewer.
5. Keep the command window open while browsing. Press **Ctrl+C** in that window to stop the server.

The launcher first tries ports 8000–8010 and automatically uses a free port if they are already occupied. The browser opens the correct local address for that port. Python 3 and an internet connection (for the Three.js CDN modules) are required.

## 3D model formats
The viewer accepts `.fbx`, `.glb`, `.gltf`, `.obj`, `.stl`, and `.ply`.

- **GLB** is recommended for sharing because it can package model materials and textures into one file.
- **GLTF** files may refer to external `.bin` and texture files. This basic single-file uploader cannot automatically locate those related files; export as `.glb` when possible.
- **FBX** and **OBJ** models may depend on separate texture files. The model geometry can load without them, but textures may be missing.
- STL and PLY generally contain geometry and may not include full material/texture information.
- The browser loads selected models locally; this project does not upload them to a server.
- Very large files may take time or exceed available browser memory.

## Profile image
The profile photo is display-only. It loads from the path configured in `js/profile.js`; hovering over it triggers a subtle particle effect.

## Important notes
This is a front-end portfolio starter, not a backend. Contact links open the user's email or phone app; there is no database, login, or server-side form.


## Set your permanent profile photo
1. Copy your photo into the website's `assets` folder, for example `assets/jayaakash.jpg`.
2. Open `js/profile.js`.
3. Set `profileImage: "assets/jayaakash.jpg"` (the filename and extension must match exactly).
4. Upload/commit both the updated JavaScript file and the image to your hosting repository.

The website loads this configured image automatically on every device. The profile image is display-only; there is no click-to-select or drag-and-drop image control.


## Recent visual updates
- Education now sits to the right of the Profile details on wider screens and stacks responsively on small screens.
- Skill and language bars display numeric percentages.
- Language percentages can be set explicitly with `percentage` in `js/profile.js`; otherwise they are estimated from the proficiency label.
- Non-photo cards use a subtle lift/border hover treatment. The profile photo keeps its distinct particle effect.


## Skills display
- Removed all percentage/proficiency bars from the Skills & Contact page.
- Languages now show text-only proficiency labels (for example Basic, Intermediate, Fluent).
- Primary skills: Maya/3D, Blender/3D, Substance Painter, Photoshop, Premiere Pro, Illustrator.
- Secondary skills are shown in a separate group below Primary Skills: Flute Playing and Drawing.


## Show hosted 3D models without visitor downloads

The Projects page now has a **Browser-Ready Showcase** gallery. This loads published models directly inside the page, so visitors do not need to select or download model files.

**Important:** the ZIP you provided did not contain your actual 3D model files. The gallery is prepared, but it cannot display your personal models until you add them:
1. Export each model from Maya/Blender as a self-contained `.glb` file (GLB is recommended).
2. Copy each `.glb` into `assets/models/`.
3. Edit `js/hosted-models.js` and add an entry for each file. Example:
   ```js
   window.PORTFOLIO_MODELS = [
     { title: "CCTV Camera", description: "Low-poly hard-surface model.", file: "assets/models/cctv-camera.glb" },
     { title: "Truck", description: "Hard-surface vehicle model.", file: "assets/models/truck.glb" }
   ];
   ```
4. Publish the whole website folder—including `assets/models/`—to GitHub Pages or another static host. Visitors can then view the models in-browser; they do not need to download the source model files.

The optional **Choose 3D file** control remains available for your own local previews. For the hosted gallery, visitors do not need to upload anything. A browser cannot launch a local server by itself when someone double-clicks `index.html`; use `START_PORTFOLIO.bat` for local testing or publish the site to static hosting for a public web link.

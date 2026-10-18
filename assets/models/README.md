# Hosted 3D models

Place your exported, self-contained `.glb` models in this folder. Example:

- `cctv-camera.glb`
- `truck.glb`
- `mini-robot.glb`

Then edit `../js/hosted-models.js` and add entries such as:

```js
window.PORTFOLIO_MODELS = [
  {
    title: "CCTV Camera",
    description: "Low-poly hard-surface model made in Maya.",
    file: "assets/models/cctv-camera.glb"
  },
  {
    title: "Truck",
    description: "Hard-surface vehicle model.",
    file: "assets/models/truck.glb"
  }
];
```

Publish the HTML, JavaScript, and model files together. Visitors can rotate and zoom the models directly on the website without downloading the model files themselves. Use files you own or have permission to publish.

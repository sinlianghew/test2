# MSIG Webpack Build

This is a webpack front-end build system with babel, twig and less. It comes with auto-reload for development and postcss for production builds.

### Installation

This requires [Node.js](https://nodejs.org/) to run. The version should be greater than 10.

Install all the dependencies.

```sh
$ npm install
```

To run a development server

```sh
$ npm run dev
```

To build for production

```sh
$ npm run build
```

To deploy to the hosting

```sh
$ npm run build
$ firebase deploy --only hosting
```

Note: Firebase needs `firebase tools` to be installed. Please install and login with your GrowthOps email. Once the the site is deployed to firebase, it will provide you the link to view it.

### What the Production build does

- It bundles all the JS and CSS into their one file, respectively.
- It minifies the CSS and JS. This can be turned off if needed by configuring `webpack.prod.js`.
- It builds the twig templates into HTML
- It also builds the SVG icon sprite map for all the icons placed in the icons folder
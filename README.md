<h1 align="center"> swell UI </h1>
https://swellui.com

### Components to build front-end experiences using https://swell.is

---
## Documentation

### Installing

`npm install swellui`

## Packages

| Name                                                                                                                 |                                                              Version                                                              |                                                              Downloads                                                               |
| :------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------: |
| [`swellUi`](https://github.com/BigCTO/swellui/)             |       [![npm version](https://img.shields.io/npm/v/swellui)](https://www.npmjs.com/package/swellui)       |       [![npm downloads](https://img.shields.io/npm/dt/swellui)](https://www.npmjs.com/package/swellui)       |



## Getting Started
---

Wrap the app with `SwellProvier`.
```jsx
import { CommerceProvider } from "swellui";

function MyApp() {
    return (
        <CommerceProvider>
            <App ... >
            <Routes ... >
            <Script ... >
        </CommerceProvider>
    )
}
```
Now you can use `CommerceContext` from anywhere inside App or Routes.
```jsx
import { CommerceContext } from "swellui";

function Product() {
    const {
        store: { commerce, products },
    } = useContext(CommerceContext);
}
```

## Updating the library (Dev)
- After new updates, the package version should be updated in `package.json` and publish to npm.

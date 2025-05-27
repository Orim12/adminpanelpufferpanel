# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## MongoDB Setup

Create a `.env` file in the root of your project with:

```
MONGODB_URI=mongodb://<username>:<password>@mongodbs.mirovaassen.nl:27017
MONGODB_DB=minecraftpanel
```

Replace `<username>` and `<password>` with your MongoDB credentials.

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies:

With **npm**:
```bash
npm install
npm run dev
# or start the server and open the app in a new browser tab
npm run dev -- --open
```

With **yarn**:
```bash
yarn install
yarn dev
# or start the server and open the app in a new browser tab
yarn dev --open
```

## Building

To create a production version of your app:

With **npm**:
```bash
npm run build
```
With **yarn**:
```bash
yarn build
```

You can preview the production build with:

With **npm**:
```bash
npm run preview
```
With **yarn**:
```bash
yarn preview
```

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

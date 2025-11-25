# Authlance React Dashboard  
A modular, extensible dashboard for authentication, billing, and licensing — built on modern React, TypeScript, shadcn/ui, TanStack Query, and a pluggable extension framework.

## Overview

The **Authlance Dashboard** is the front-end component of the Authlance platform.  
It provides a modern, themeable dashboard used to manage:

- Users & groups  
- Roles & permissions  
- Licensing & billing  
- Application-level extensions  
- Dashboard customizations (routes, layouts, contextual actions)

The dashboard is built to be **fully modular**. You can ship your own packages that contribute:

- Routes  
- UI components  
- Sidebar entries  
- Table actions  
- Prerender contexts  
- Branding & layout overrides  

This makes it possible to build a fully white-labeled authentication portal while keeping the underlying system secure and upgradeable.

## Features

- ⚡ **React + TypeScript + Webpack**  
- 🎨 **shadcn/ui** customizable component system  
- 🔒 **Role-based access control (RBAC)** handled at route level  
- 🧩 **Extension points** for adding your own views and business logic  
- 🔁 **Shared data layer** using TanStack Query  
- 🧱 **Layout slots** for header, sidebar, and contextual actions  
- 🧪 **Local development scaffolding** via loop-scaffold  
- ⚙️ **Backend-agnostic** (identity/billing/license services remain proprietary)

## Getting Started

### Requirements

- **Node.js 20+**  
- **Yarn** (classic, no PnP)  
- **Python 3.10+**  

### Install dependencies

```bash
yarn
```

### Development Mode

```bash
yarn run watch
```
Then start from launch.json 

### Production Build

```bash
yarn build
```

Single package:

```bash
npx run build @authlance/core
```

## Project Structure

```
packages/
  common/
  core/
  events-queue/
  identity/
  license-core/
  license-layout/
  payments/
  postmark/
  prerender-cache/
  sequelize/
  sidebar/
  ui/
scripts/
  package-epl-sources.sh
```

## Building Extensions

Extensions can contribute:

- Pages  
- Routes  
- Menu entries  
- Layout slots  
- Prerender & runtime contributions  

Documentation lives under:

```
See the [Extending Authlance guide](https://authlance.com/docs/framework/extending-authlance) for detailed instructions, examples, and reference material.
```

## Licensing

### Business Source License (BSL 1.1)

Authlance-authored files use **BSL 1.1**, changing to Apache 2.0 on the future change date.

### Eclipse Public License (EPL 2.0)

EPL-derived files retain their license headers and are bundled into:

```
epl-source-bundle.zip
```

Regenerate with:

```bash
./package-epl-sources.sh
```

Backend components (identity, billing, license operator) are **proprietary**.

## Contributing

Issues and PRs are welcome. For major changes, open an issue first.

## Support

Commercial support is available. Open an issue or visit the Authlance website.

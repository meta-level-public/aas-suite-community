# AAS Suite Community

The AAS Suite Community version provides core open-source components for development, evaluation, and custom deployments around the Asset Administration Shell.

## Overview

This repository contains the community core of the AAS Suite with source code, Docker Compose artifacts, and public documentation.

It is particularly suited for:

- local getting-started with Docker Compose
- technical evaluation of the Community version
- further development of the included open-source components

## Why AAS Suite Community

With the AAS Suite Community you can build, deploy, and integrate Asset Administration Shells into existing technical landscapes in a practical way.

It supports, among other things:

- quickly deploying AAS-related services and interfaces locally
- evaluating data models, integrations, and technical workflows in a realistic environment
- efficiently supporting manual processes with suitable wizards and guided workflows
- connecting external AAS infrastructures and adjacent systems
- implementing custom extensions and adaptations based on the open-source components
- giving teams a quick start into AAS-related development and operations scenarios

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Starting locally with code checkout

```bash
docker compose -p aas-dev-oss -f docker-oss/docker-compose.local.yml up -d
```

For more advanced setups and portable stacks, Compose templates and helper files are available in the [docker-oss/](docker-oss/) directory. Additional information can be found in [docker-oss/DOCKER_README.md](docker-oss/DOCKER_README.md).

### Local development with VS Code

The repository includes a VS Code workspace profile under \`.vscode-oss/\` tailored to the Community variant.

1. Open the project in VS Code (workspace root: repository root)
2. Start the launch target **"Launch Community Stack"** – this simultaneously starts the Gateway service, the Designer API (Community), and the Angular dev server of the Community frontend app
3. Once all three processes are running, frontend debugging can be started via the launch target **"Debug AAS Designer Community (Chrome)"**

### Creating a portable environment without code checkout

If you do not want to set up a local development environment with a repository checkout, you can use the Docker Compose Wizard instead. This creates a portable runtime environment with the required Compose files and assets.

```bash
bash tools/docker-compose-wizard/oss/create-compose-oss.sh
```

The wizard creates a ready-to-start stack in a separate directory. More information can be found in [tools/docker-compose-wizard/oss/README.md](tools/docker-compose-wizard/oss/README.md).

## Repository Contents

- [docker-oss/](docker-oss/) contains the Docker Compose artifacts for the Community version.
- [docs-oss/](docs-oss/) contains the public OSS documentation.
- [frontend/](frontend/) contains the frontend parts of the Community version.
- [services/](services/) contains the backend services and shared components.

## Documentation

Further documentation can be found under [docs-oss/](docs-oss/).

## Contributing

Community contributions, issues, and pull requests are welcome. For contribution guidelines see [CONTRIBUTING.md](CONTRIBUTING.md).

Please describe changes, motivation, and use case as specifically as possible so that the review can be done efficiently.

For transparency: This repository is provided as a one-way mirror from the main development. Contributions and pull requests are therefore reviewed and, if accepted, manually incorporated into the primary development environment.

## License

The AAS Suite Community version is made available under the MIT License.

## Contact

More information can be found at [aas-suite.de](https://aas-suite.de) or on our homepage [meta-level.de](https://meta-level.de).

If you are looking for support, extended features, or concrete ways to implement project-specific requirements, you will also find information about the Enterprise version at [aas-suite.de](https://aas-suite.de). Feel free to contact us.

## Note

This README is automatically generated during the OSS export.

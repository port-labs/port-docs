
# Bitbucket-Ocean Integration

![Bitbucket](https://img.shields.io/badge/Bitbucket-0747a6?style=for-the-badge&logo=bitbucket&logoColor=white)
![Port](https://img.shields.io/badge/Port-0A66C2?style=for-the-badge&logo=port&logoColor=white)

The **Bitbucket-Ocean Integration** synchronizes Bitbucket repositories, projects, and pull requests with Port's Ocean framework, providing a unified view of your development pipeline.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## Overview

This integration connects Bitbucket to Port's Ocean framework, enabling real-time synchronization of:

- **Repositories**
- **Projects**
- **Pull Requests**
- **Components**

---

## Prerequisites

Before setting up the integration, ensure you have the following:

- **Port Account**: Access to your Port workspace. [Sign up here](https://www.getport.io/).
- **Bitbucket Account**: Administrative privileges and an API token.
- **Ocean CLI**: Installed on your system. [Installation guide](https://ocean.getport.io/getting-started/).
- **Python 3.11+**: Required to run the integration.

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Gahdloot/port-docs.git
   cd ocean/integrations/bitbucket-cloud
   ```

2. **Generate `.env`**:
    Run command
    ```bash
        cp .env.example .env
    ```
   - Add your Bitbucket token, workspace, and other configurations in the .env file

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Integration**:
   - **Locally**:
     ```bash
     ocean sail
     ```

---

## Usage

### Webhooks
The integration registers a webhook with Bitbucket to receive real-time updates for the following events:
- `repo:push`
- `pullrequest:created`

### Resync Data
Trigger a resync to fetch existing data from Bitbucket:
```bash
port ocean resync
```

---


### Supported Resources
- **Repository**: Syncs repository details.
- **Project**: Syncs project details.
- **Pull Request**: Syncs pull request details.
- **Component**: Syncs components.
---

## Troubleshooting

### Resync Issues
- Verify the Bitbucket token and workspace are correct.
- Check logs for detailed error messages.

---

## Support

For assistance, contact [Port Support](https://www.getport.io/support).

---
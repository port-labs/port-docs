# Bitbucket-Ocean Integration

## Overview

The **Bitbucket-Ocean Integration** enables seamless synchronization between Bitbucket and Port's Ocean framework. It allows users to ingest Bitbucket projects, repositories, and pull requests into Port, providing a unified view of their development workflows.

## Prerequisites

Before setting up the integration, ensure you have the following:

* **Port Account**: Access to your Port workspace.
* **Bitbucket Account**: Administrative access to your Bitbucket workspace.
* **Ocean CLI**: Installed on your local machine. Follow the [Ocean CLI installation guide](https://ocean.getport.io/getting-started/) if not installed.

## Installation

### 1\. Clone the Repository

``` bash
git clone https://github.com/kanmitcode/ocean.git
cd ocean
```

### 2\. Set Up Environment Variables

Create a `.env` file in the root directory and add the following:

``` ini
BITBUCKET_WORKSPACE=<your-bitbucket-workspace>
BITBUCKET_USERNAME=<your-bitbucket-username>
BITBUCKET_APP_PASSWORD=<your-app-password>
PORT_CLIENT_ID=<your-port-client-id>
PORT_CLIENT_SECRET=<your-port-client-secret>
```

### 3\. Install Dependencies

``` bash
pip install -r requirements.txt
```

## Running the Integration

### Fetch and Ingest Data

``` bash
python3 -m bitbucket_ocean.main
```

This fetches projects, repositories, and pull requests from Bitbucket and pushes them to Port.

### Running Webhooks

If you want to handle real-time Bitbucket events, ensure the webhook is set up in Bitbucket and run:

``` bash
python webhook_handler.py
```

## API Endpoints

### Fetch Bitbucket Projects

``` http
GET https://api.bitbucket.org/2.0/workspaces/{workspace}/projects
```

### Fetch Bitbucket Repositories

``` http
GET https://api.bitbucket.org/2.0/repositories/{workspace}
```

### Fetch Pull Requests

``` http
GET https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/pullrequests
```

## Logging and Debugging

Logging is configured at the `DEBUG` level. If needed, modify the logging settings in `bitbucket_ocean_integration.py`:

``` python
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
```

## Conclusion

The Bitbucket-Ocean integration streamlines your development workflow by syncing Bitbucket data into Port. Follow the installation steps to get started and customize it as needed for your organization.
<details>
<summary><b>Very short Quickstart Guide for macOS</b></summary>


1. Download and Install [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/)

2. Install abctl:

```code
curl -LsfS https://get.airbyte.com | bash -
```

3. Install Airbyte locally:

```code
abctl local install
```

The application will be available by default in http://localhost:8000/

You can find your password by typing in a terminal (see screenshot):

```code
abctl local credentials
```

<img src="/img/build-your-software-catalog/custom-integration/s3integrations/airbyteLocalSetupExample.png" width="70%" border="1px" />

</details>
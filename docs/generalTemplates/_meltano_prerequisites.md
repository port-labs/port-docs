import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).

- This feature is part of Port's limited-access offering. To obtain the required S3 bucket, please contact our team directly via chat, [Slack](https://www.getport.io/community), or [e-mail](mailto:support@getport.io), and we will create and manage the bucket on your behalf.

- Access to an available Meltano app - for reference, follow the [quick start guide](https://docs.meltano.com/getting-started/installation), or follow the following steps:

<Tabs groupId="Install Meltano" queryString values={[{label: "shell", value: "shell"}]}>
<TabItem value="shell" label="shell">

1. Install python3

    ```shell
    brew install python3
    ```

2. Create a python virtual env:

    ```shell
    python -m venv .venv
    source .venv/bin/activate
    ```

3. Install meltano & follow installation instructions

    ```shell
    pip install meltano
    ```

4. Change to meltano project

    ```shell
    cd <name_of_project>
    ```

</TabItem>
</Tabs>

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

:::info Direct access via URL
After configuring the SSO connection, you can initiate the login flow directly via URL.  
Use the following URL based on your account region, and make sure to to replace `{CONNECTION_NAME}` with the value provided to you by Port.

<Tabs>
  <TabItem value="EU" label="EU">
    ```text
    https://auth.getport.io/authorize?response_type=token&client_id=96IeqL36Q0UIBxIfV1oqOkDWU6UslfDj&connection={CONNECTION_NAME}&redirect_uri=https%3A%2F%2Fapp.getport.io
    ```
  </TabItem>
  <TabItem value="US" label="US">
    ```text
    https://auth.us.getport.io/authorize?response_type=token&client_id=4lHUry3Gkds317lQ3JcgABh0JPbT3rWx&connection={CONNECTION_NAME}&redirect_uri=https%3A%2F%2Fapp.us.getport.io
    ```
  </TabItem>
</Tabs>
:::

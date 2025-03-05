import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

Here is an example `port.yml` file:

```yaml showLineNumbers
identifier: myEntity
title: My Entity
blueprint: myBlueprint
properties:
  myStringProp: myValue
  myNumberProp: 5
  myUrlProp: https://example.com
relations:
  mySingleRelation: myTargetEntity
  myManyRelation:
    - myTargetEntity1
    - myTargetEntity2
```

- The `identifier` key is used to specify the identifier of the entity that the app will create and keep up-to-date when changes occur:

  ```yaml showLineNumbers
  // highlight-next-line
  identifier: myEntity
  title: My Entity
    ...
  ```

- The `title` key is used to specify the title of the entity:

  ```yaml showLineNumbers
  identifier: myEntity
  // highlight-next-line
  title: My Entity
    ...
  ```

- The `blueprint` key is used to specify the identifier of the blueprint to create this entity from:

  ```yaml showLineNumbers
  ...
  title: My Entity
  // highlight-next-line
  blueprint: myBlueprint
    ...
  ```

- The `properties` key is used to map the values to the different properties of the entity:

  ```yaml showLineNumbers
  ...
  title: My Entity
  blueprint: myBlueprint
  // highlight-start
  properties:
    myStringProp: myValue
    myNumberProp: 5
    myUrlProp: https://example.com
  // highlight-end
    ...
  ```

- The `relations` key is used to map target entities to the different relations of the entity:

  <Tabs>

  <TabItem value="single" label="Single relation">

  ```yaml showLineNumbers
  ...
  properties:
    myStringProp: myValue
    myNumberProp: 5
    myUrlProp: https://example.com
  // highlight-start
  relations:
    mySingleRelation: myTargetEntity
  // highlight-end
  ```

  </TabItem>

  <TabItem value="many" label="Many relation">

  ```yaml showLineNumbers
  ...
  properties:
    myStringProp: myValue
    myNumberProp: 5
    myUrlProp: https://example.com
  // highlight-start
  relations:
    myManyRelation:
      - myTargetEntity1
      - myTargetEntity2
  // highlight-end
  ```

  </TabItem>

  </Tabs>

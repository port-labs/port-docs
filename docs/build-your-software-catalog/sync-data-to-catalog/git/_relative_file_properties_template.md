It is also possible to use paths relative to the location of the `port.yml` spec file.

The following example reads `README.md` and `module1/requirements.txt` using paths relative to `port.yml`

Repository folder structure used for the example:

```
root
|
+-+ meta
|   |
|   +-- port.yml
|   |
|   +-+ README.md
|
+-+ module1
|   |
|   +- requirements.txt
|   |
|   +-+ src
...
```

port.yml:

```yaml showLineNumbers
blueprint: code_module
title: Module 1
identifier: module_1_entity
---
properties:
  readme: file://./README.md
  module1Requirements: file://../module1/requirements.txt
```

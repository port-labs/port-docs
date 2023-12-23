It is also possible to use paths relative to the location of the `port.yml` spec file.

For example: `file://./` is used to reference a file in the same directory as the `port.yml` file. `file://../` is used to reference a file that is one directory above and so on.

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

`port.yml` file:

```yaml showLineNumbers
blueprint: code_module
title: Module 1
identifier: module_1_entity
properties:
  readme: file://./README.md
  module1Requirements: file://../module1/requirements.txt
```

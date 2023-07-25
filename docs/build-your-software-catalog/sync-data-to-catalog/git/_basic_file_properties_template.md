It is possible to use the contents of files in the repository as the value for entity properties using a simple reference.

The following example will read the string contents of `~/module1/README.md` and upload it to `myStringProp` of the specified entity.

Repository folder structure used for the example:

```
root
|
+- port.yml
|
+-+ module1
|   |
|   +- README.md
|   |
|   +-+ src
...
```

port.yml:

```yaml showLineNumbers
blueprint: code_module
title: Module 1
identifier: module_1_entity
properties:
  myStringProp: file://module1/README.md
```

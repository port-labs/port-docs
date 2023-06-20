The content of files in the repository can be pushed to string properties of entities with a simple reference.

The following example will read the string content of `~/module1/README.md` and upload it to `myStringProp`.

Repository folder structure:

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

---
properties:
  myStringProp: file://module1/README.md
```

#### Relative paths

Relative paths are also supported, relative to the port.yml spec file, so `file://./` would mean the same route as `port.yml` and `file://../` would mean one directory above it.

The following example reads `README.md` and `module1/requirements.txt` using paths relative to `port.yml`

Repository folder structure:

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

---
properties:
  readme: file://./README.md
  module1Requirements: file://../module1/requirements.txt
```

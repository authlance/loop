# Shared NPM script for Theia packages.

`authlance-ext` is a command line tool to run shared npm scripts in Theia packages. 

For instance, if you want add a new `hello` script that prints `Hello World`:

- add a new script to [package.json](./package.json) with the `ext:` prefix.

```json
{
    "name": "@authlance/ext-scripts",
    "scripts": {
        "ext:hello": "echo 'Hello World'"
    }
}
```

- install `authlance-ext` in your package (the actual version can be different)

```json
{
    "name": "@authlance/myextension",
    "devDependencies": {
        "@authlance/ext-scripts": "^0.1.1"
    }
}
```

- you should be able to call `hello` script in the context of your package:

```shell
    npx authlance-ext hello
````

- and from npm scripts of your package:

```json
{
    "name": "@authlance/myextension",
    "scripts": {
        "hello": "authlance-ext hello"
    }
}
```

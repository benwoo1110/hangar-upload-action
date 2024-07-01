# Hangar Upload Action
A GitHub Action to upload releases to [hangar.papermc.io](https://hangar.papermc.io).

## Basic Example
This is a basic example with all required options:
```yaml
name: 'Upload to Hangar'

on:
  release:
    types: [published] # Only trigger on publishing releases

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      # Previous steps to create your Jar file(s).
      - uses: benwoo1110/hangar-upload-action@v1
        with:
          api_token: ${{ secrets.HANGAR_TOKEN }}
          slug: 'MyProject'
          version: ${{ github.event.release.tag_name }}
          channel: release
          files: |
            [
              {
                "path": "path/to/MyProject.jar",
                "platforms": ["PAPER"]
              }
            ]
```

## Options
| Option                  | Required? | Description                                                                                          |
|-------------------------|-----------|------------------------------------------------------------------------------------------------------|
| `api_token`             | Yes       | The Hangar Token to use.<br>**Do not directly use the token in the YAML file! Instead use Secrets!** |
| `slug`                  | Yes       | The unique project name used on Hangar.                                                              |
| `version`               | Yes       | The version of this new release.                                                                     |
| `channel`               | Yes       | The release channel to publish this release under. A project on Hangar by default has "release".     |
| `files`                 | Yes       | String matching a valid [Files JSON Array](#file-json-array).                                        |
| `description`           | No        | The description (changelog) of the version.                                                          |
| `plugin_dependencies`   | No        | String representation of a [Plugin Dependencies JSON Object](#plugin-dependencies-json-object).      |
| `platform_dependencies` | No        | String representation of a [Platform Dependencies JSON Object](#platform-dependencies-json-object).  |

## Structures
> [!IMPORTANT]
> The below provided information is provided "as-is" without guarantee of being accurate or up-to-date.  
> Please double-check first with the [official Hangar API Docs](https://hangar.papermc.io/api-docs#post-/api/v1/projects/-slug-/upload) to verify the correctness of the displayed structures.

### File JSON Array
The `files` option requires the input to be a valid JSON Array containing JSON objects with the following structure:

- `platforms` with an array of supported platform names. Allowed values are `PAPER`, `VELOCITY` and `WATERFALL`
- **Either one of the below options:**
  - `path` with a String representing the path to a Jar file to upload.
  - `url` and `externalUrl` with the former holding a true value and the latter a URL for the download.

Here is an example JSON array for a uploadet jar:
```json
[
  {
    "platforms": ["PAPER"],
    "path": "path/to/MyProject.jar"
  }
]
```
And here an example with an external download:
```json
[
  {
    "platforms": ["PAPER"],
    "url": true,
    "externalUrl": "https://example.com/download/MyProject.jar"
  }
]
```

### Plugin Dependencies JSON Object
The `plugin_dependencies` option requires the following Stringyfied JSON Object structure:

- `<platform_name>` which can be either `PAPER`, `VELOCITY` or `WATERFALL` based on the platform.
  - `name` with the name of the plugin. When `externalUrl` isn't used should this match an existing Project Slug.
  - `required` with a boolean to set wether this dependency is required or not.
  - `externalUrl` with a URL to the plugin. If not set (or set to `null`) will `name` be treated as a Project Slug.

Example Structure:
```json
[
  {
    "name": "Dependency",
    "required": true,
    "externalUrl": null
  }
]
```

### Platform Dependencies JSON Object
The `platform_dependencies` option requires the following Stringyfied JSON Object structure:

- `<platform_name>` which can be either `PAPER`, `VELOCITY` or `WATERFALL` based on the platform.
  - `<array>` of supported Minecraft versions. You can set specific versions (`1.12`), version-ranges (`1.16-1.18.2`) and/or supported minor versions (`1.20.x`).

Example Structure:
```json
{
  "PAPER": ["1.12","1.16-1.18.2","1.20.x"]
}
```

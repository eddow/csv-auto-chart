# csv-auto-chart

> Generate a user-defined chart out of a CSV
> Display specific legal charts

## Build Setup

``` bash
# install dependencies
npm install
```
## Usage/test
``` bash
# serve with hot reload at localhost:8080
npm run dev
```
### Fuse config
In orde to change one's `fuse.json` without interferences, [here is the how-to](https://stackoverflow.com/questions/9794931/keep-file-in-a-git-repo-but-dont-track-changes).
To change it at your convenience, use `git update-index --assume-unchanged fuse.json`
#### Debug plottable
In order to debug the plottable library,
- Download the submodule code with `git submodule update --init`
- Change in `fuse.json` the configuration `debug.plottable` to true
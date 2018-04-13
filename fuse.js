const {FuseBox, WebIndexPlugin, VueComponentPlugin, JSONPlugin, CSSResourcePlugin, CSSPlugin} = require("fuse-box");

const fuse = FuseBox.init({
    homeDir : "src",
    target : 'browser@es6',
    output : "dist/$name.js",
    plugins : [
        WebIndexPlugin({
				title: 'csv-auto-chart',
				template: 'index.html'
			}),
			VueComponentPlugin(),
			JSONPlugin(),
			[
				/node_modules.*\.css$/,
				CSSResourcePlugin({/*
					dist: "dist/resources",
					resolve: (f) => `/resources/${f}`,
					inline: false*/
				}),
				CSSPlugin()
			]
    ],
		shim: {
				 jquery: {
						 source: "node_modules/jquery/dist/jquery.js",
						 exports: "$",
				 },
		}
})

fuse.dev();
fuse.bundle("vendor").instructions(" ~ index.ts");
fuse.bundle("index").instructions(" !> [index.ts]").hmr().watch().sourceMaps(true);
fuse.run();
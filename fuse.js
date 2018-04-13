const {FuseBox, WebIndexPlugin, VueComponentPlugin, JSONPlugin, CSSPlugin} = require("fuse-box");

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
			CSSPlugin(/*{
				group: 'index.css',
				outFile: 'dist/index.css'
			}*/)
    ],
    alias: {
			"vue": "vue/dist/vue.esm.js",
			"vue-router": "vue-router/dist/vue-router.esm.js"
		},
		shim: {
				 jquery: {
						 source: "node_modules/jquery/dist/jquery.js",
						 exports: "$",
				 },
		}
})

fuse.dev({
	open : true,
	port: 8080
});
fuse.bundle("vendor").instructions(" ~ index.ts");
fuse.bundle("index").instructions(" !> [index.ts]").hmr().watch();//.sourceMaps(true);
fuse.run();
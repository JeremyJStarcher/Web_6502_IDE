import typescript from 'rollup-plugin-typescript';

export default {
	input: './lib/ts/main.ts',
	plugins: [
		typescript()
	],
	output: {
		sourcemap: "./lib/ts/bundle.js.map",
		file: './lib/ts/bundle.js',
		format: 'cjs'
	},
}

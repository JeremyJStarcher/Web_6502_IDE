import typescript from 'rollup-plugin-typescript';

export default [
	{
		input: './lib/ts/main.ts',
		plugins: [
			typescript()
		],
		output: {
			sourcemap: "./lib/ts/main-bundle.js.map",
			file: './lib/ts/main-bundle.js',
			format: 'es'
		},
	},
	{
		input: './lib/ts/dasm.ts',
		plugins: [
			typescript()
		],
		output: {
			sourcemap: "./lib/ts/dasm-bundle.js.map",
			file: './lib/ts/dasm-bundle.js',
			format: 'es'
		},
	},
]

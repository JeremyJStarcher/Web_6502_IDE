import typescript from 'rollup-plugin-typescript';

export default [
	{
		input: './ts/fc-main.ts',
		plugins: [
			typescript()
		],
		output: {
			sourcemap: "./ts/fc-bundle.js.map",
			file: './ts/fc-bundle.js',
			format: 'es'
		},
	},
]

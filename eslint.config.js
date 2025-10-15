import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint, { parser } from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config([
	globalIgnores(["dist"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			// ...tseslint.configs.recommendedTypeChecked,
			reactHooks.configs["recommended-latest"],
			reactRefresh.configs.vite,
			// ...tseslint.configs.stylisticTypeChecked,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		languageOptions: {
			parser: parser,
			// parserOptions: {
			// 	project: "./tsconfig.json",
			// },
		},
		plugins: {
			"@stylistic": stylistic,
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"no-constant-condition": "warn",
			eqeqeq: ["warn", "always", { null: "ignore" }],
			"@stylistic/indent": [
				"error",
				"tab",
				{
					SwitchCase: 1,
					offsetTernaryExpressions: true,
					ignoredNodes: ["TSTypeAnnotation *"],
				},
			],
		},
	},
]);

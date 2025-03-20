import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';


export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ["dist/**"], // Add this line to ignore the dist folder
  },
);
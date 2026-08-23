import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// eslint-config-next 16 ships a flat config array directly, so no FlatCompat.
const config = [
  { ignores: [".next/**", "node_modules/**", "src/generated/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
];

export default config;

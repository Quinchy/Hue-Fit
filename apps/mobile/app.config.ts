// @ts-nocheck

export default ({ config }) => ({
  ...config,
  extra: {
    apiUrl: process.env.API_URL || "http://localhost:3000",
  },
});
  
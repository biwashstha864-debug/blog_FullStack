import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: process.env.NODE_ENV || "development",

JWT_ACCESS_SECRET : "346346954e2fe72d44401973a3b81427b29e3fe0026656bb73c13223d74e7ddfa90687c86586b8c41a628cac95ab5e78f9d399654da18221b438222c89cbf8c0",
JWT_REFRESH_SECRET : "0f71756b70597b9249c78239ff794cb2e701b15e58794356466e0abaead56672b31dfef272eead478567bfdf5e14117f978f577a3398c24edf3ff5a5f12e2433"
};
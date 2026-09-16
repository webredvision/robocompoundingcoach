import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve("/rvdata/secrets/robocompoundingcoach/.env"),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com", "redvisionweb.com", "www.redvisionweb.com", "wealthelite.in"],
  },
};

export default nextConfig;
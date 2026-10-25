import os from "os";
import path from "path";

process.env.DATABASE_URL = "file:./test.db";
process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";
process.env.UPLOAD_DIR = path.join(os.tmpdir(), "dealership-test-uploads");

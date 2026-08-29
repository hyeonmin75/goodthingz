import { access, unlink } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const buildServerDir = path.resolve(projectRoot, "build", "server");
const privateArtifact = path.resolve(buildServerDir, ".dev.vars");

if (!privateArtifact.startsWith(`${buildServerDir}${path.sep}`)) {
	throw new Error("Refusing to clean a path outside build/server.");
}

try {
	await access(privateArtifact);
	await unlink(privateArtifact);
	console.log("Removed local private artifact from build/server.");
} catch (error) {
	if (error?.code !== "ENOENT") {
		throw error;
	}
}

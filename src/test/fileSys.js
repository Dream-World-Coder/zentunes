import { Filesystem } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

export async function debugFilesystem(DIR) {
    try {
        console.log("\n\n\n\n=== FILESYSTEM DEBUG ===");
        console.log("Platform:", JSON.stringify(Capacitor.getPlatform()));
        console.log(
            "Native platform:",
            JSON.stringify(Capacitor.isNativePlatform()),
        );

        // Check permissions
        const permissions = await Filesystem.checkPermissions();
        console.log("Current permissions:", JSON.stringify(permissions));

        // Try to read root Documents directory
        /*
        try {
            const docsRoot = await Filesystem.readdir({
                path: "",
                directory: DIR,
            });
            console.log("Documents root contents:", JSON.stringify(docsRoot));
        } catch (err) {
            console.log("Cannot read Documents root:", err.message);
        }
        */

        // Try to read audios directory
        try {
            const audiosDir = await Filesystem.readdir({
                path: "audios",
                directory: DIR,
            });
            console.log(
                "Audios directory contents:",
                JSON.stringify(audiosDir),
            );
            for (const sdir of audiosDir.files) {
                const contents = await Filesystem.readdir({
                    path: `audios/${sdir.name}`,
                    directory: DIR,
                });
                console.log(
                    `${sdir.name} directory contents:`,
                    JSON.stringify(contents),
                );
            }
        } catch (err) {
            console.log("Audios directory error:", err.message);
        }

        console.log("=== END FILESYSTEM DEBUG ===");
    } catch (error) {
        console.error("Debug filesystem error:", error);
    }
}

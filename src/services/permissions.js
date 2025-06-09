import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

// Function to request and check file permissions
export async function requestFilePermissions() {
    try {
        await Filesystem.writeFile({
            path: "audios/home/test.txt",
            data: "This file ensures directory ownership.",
            directory: Directory.Data,
            recursive: true,
        });

        // Check if running on native platform
        if (!Capacitor.isNativePlatform()) {
            console.log("Running on web - no permissions needed");
            return true;
        }

        // Request permissions
        const permissions = await Filesystem.requestPermissions();

        console.log("Permission status:", JSON.stringify(permissions));

        if (permissions.publicStorage === "granted") {
            console.log("File permissions granted");
            return true;
        } else if (permissions.publicStorage === "denied") {
            console.log("File permissions denied");
            return false;
        } else {
            // Handle 'prompt' status - request again
            console.log("Permission prompt - requesting again");
            const newPermissions = await Filesystem.requestPermissions();
            return newPermissions.publicStorage === "granted";
        }
    } catch (error) {
        console.error("Error requesting permissions:", error);
        return false;
    }
}

// Function to check current permissions
export async function checkFilePermissions() {
    try {
        if (!Capacitor.isNativePlatform()) {
            return {
                granted: true,
                message: "Web platform - no permissions needed",
            };
        }

        const permissions = await Filesystem.checkPermissions();

        return {
            granted: permissions.publicStorage === "granted",
            status: permissions.publicStorage,
            message: `File permissions: ${permissions.publicStorage}`,
        };
    } catch (error) {
        console.error("Error checking permissions:", error);
        return { granted: false, message: error.message };
    }
}

export async function safeReadDir(path, directory) {
    try {
        const hasPermission = await requestFilePermissions();

        if (!hasPermission) {
            throw new Error("Directory read permission denied");
        }

        const result = await Filesystem.readdir({
            path: path,
            directory: directory,
        });

        console.log("Directory read successfully:", path);
        return result;
    } catch (error) {
        console.error("Error reading directory:", error);
        throw error;
    }
}

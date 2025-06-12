import { Filesystem } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
// import { Media } from "@capacitor-community/media";

/** Function to request and check file permissions [to scan audios] */
export async function requestFilePermissions() {
  try {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    // This WILL show the permission dialog: photos / videos
    // const result = await Media.requestPermissions();
    // console.log("Media permissions:", result);

    // return result.read === "granted";

    const permissions = await Filesystem.requestPermissions();
    console.log("Permission status:", JSON.stringify(permissions));

    return permissions.publicStorage === "granted";
  } catch (error) {
    console.error("Error requesting permissions:", error);
    return false;
  }
}

/** Function to check current permissions */
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

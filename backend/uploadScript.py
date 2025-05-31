#!/usr/bin/env python3
"""
Bulk Audio Uploader Script
Uploads multiple audio files to Flask audio API one by one
"""

import os
import base64
import requests
import json
import time
from pathlib import Path
from typing import List

class BulkAudioUploader:
    def __init__(self, api_base_url: str = "https://subhajit3498.pythonanywhere.com"):
        self.api_base_url = api_base_url.rstrip('/')
        self.upload_endpoint = f"{self.api_base_url}/add-audio"
        self.valid_extensions = {'.mp3', '.m4a', '.wav', '.ogg'}

    def file_to_base64(self, file_path: str) -> str:
        """Convert audio file to base64 string"""
        try:
            with open(file_path, 'rb') as audio_file:
                return base64.b64encode(audio_file.read()).decode('utf-8')
        except Exception as e:
            raise Exception(f"Failed to read file {file_path}: {str(e)}")

    def is_valid_audio_file(self, file_path: str) -> bool:
        """Check if file has valid audio extension"""
        return Path(file_path).suffix.lower() in self.valid_extensions

    def upload_audio_file(self, file_path: str, security_key: str, subdir_path: str) -> dict:
        """Upload a single audio file to the API"""
        file_path = Path(file_path)

        # Validate file exists
        if not file_path.exists():
            return {"success": False, "error": f"File not found: {file_path}"}

        # Validate file extension
        if not self.is_valid_audio_file(str(file_path)):
            return {"success": False, "error": f"Invalid file extension. Allowed: {', '.join(self.valid_extensions)}"}

        try:
            # Convert file to base64
            print(f"Reading file: {file_path.name}...")
            audio_base64 = self.file_to_base64(str(file_path))

            # Prepare request data
            payload = {
                "security_key": security_key,
                "subdir_path": subdir_path,
                "filename": file_path.name,
                "audio_file": audio_base64
            }

            # Make API request
            print(f"Uploading {file_path.name}...")
            response = requests.post(
                self.upload_endpoint,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )

            # Parse response
            result = response.json()

            if response.status_code == 200:
                return {"success": True, "message": result.get('message', 'Upload successful'), "path": result.get('path')}
            else:
                return {"success": False, "error": result.get('error', f'HTTP {response.status_code}')}

        except requests.exceptions.Timeout:
            return {"success": False, "error": "Request timeout"}
        except requests.exceptions.ConnectionError:
            return {"success": False, "error": "Connection error - is the server running?"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def bulk_upload(self, file_paths: List[str], security_key: str, subdir_path: str, delay: float = 1.0) -> dict:
        """Upload multiple audio files with progress tracking"""
        results = {
            "successful": [],
            "failed": [],
            "total": len(file_paths),
            "success_count": 0,
            "failure_count": 0
        }

        print(f"\n🎵 Starting bulk upload of {len(file_paths)} files to '{subdir_path}' category")
        print("=" * 60)

        for i, file_path in enumerate(file_paths, 1):
            print(f"\n[{i}/{len(file_paths)}] Processing: {Path(file_path).name}")

            result = self.upload_audio_file(file_path, security_key, subdir_path)

            if result["success"]:
                print(f"✅ Success: {result['message']}")
                results["successful"].append({
                    "file": file_path,
                    "message": result["message"],
                    "path": result.get("path")
                })
                results["success_count"] += 1
            else:
                print(f"❌ Failed: {result['error']}")
                results["failed"].append({
                    "file": file_path,
                    "error": result["error"]
                })
                results["failure_count"] += 1

            # Add delay between uploads to avoid overwhelming the server
            if i < len(file_paths) and delay > 0:
                print(f"⏳ Waiting {delay}s before next upload...")
                time.sleep(delay)

        return results

    def get_audio_files_from_directory(self, directory_path: str, recursive: bool = False) -> List[str]:
        """Get all audio files from a directory"""
        directory = Path(directory_path)

        if not directory.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")

        audio_files = []

        if recursive:
            # Recursively find audio files
            for ext in self.valid_extensions:
                audio_files.extend(directory.rglob(f"*{ext}"))
        else:
            # Only look in the specified directory
            for ext in self.valid_extensions:
                audio_files.extend(directory.glob(f"*{ext}"))

        return [str(f) for f in sorted(audio_files)]


def main():
    # Configuration
    API_URL = "https://subhajit3498.pythonanywhere.com"  # Change this to your server URL

    print("🎵 Bulk Audio Uploader")
    print("=" * 40)

    # Get user inputs
    security_key = input("Enter security key: ").strip()
    if not security_key:
        print("❌ Security key is required!")
        return

    subdir_path = input("Enter category/subdirectory name (e.g., nature, music, podcasts): ").strip()
    if not subdir_path:
        print("❌ Category name is required!")
        return

    print("\nChoose input mode:")
    print("1. Upload files from a directory")
    print("2. Upload specific files (enter paths manually)")

    choice = input("Enter choice (1 or 2): ").strip()

    uploader = BulkAudioUploader(API_URL)
    file_paths = []

    if choice == "1":
        # Directory mode
        directory = input("Enter directory path: ").strip()
        if not directory:
            print("❌ Directory path is required!")
            return

        recursive = input("Search subdirectories recursively? (y/n): ").strip().lower() == 'y'

        try:
            file_paths = uploader.get_audio_files_from_directory(directory, recursive)
            if not file_paths:
                print(f"❌ No audio files found in {directory}")
                return

            print(f"\n📁 Found {len(file_paths)} audio files:")
            for i, fp in enumerate(file_paths, 1):
                print(f"  {i}. {Path(fp).name}")

        except FileNotFoundError as e:
            print(f"❌ {e}")
            return

    elif choice == "2":
        # Manual file paths mode
        print("\nEnter file paths (one per line, empty line to finish):")
        while True:
            file_path = input("File path: ").strip()
            if not file_path:
                break

            if Path(file_path).exists():
                if uploader.is_valid_audio_file(file_path):
                    file_paths.append(file_path)
                    print(f"✅ Added: {Path(file_path).name}")
                else:
                    print(f"❌ Invalid audio file: {Path(file_path).name}")
            else:
                print(f"❌ File not found: {file_path}")

        if not file_paths:
            print("❌ No valid files to upload!")
            return
    else:
        print("❌ Invalid choice!")
        return

    # Confirm upload
    print(f"\n📋 Upload Summary:")
    print(f"   Category: {subdir_path}")
    print(f"   Files: {len(file_paths)}")
    print(f"   Server: {API_URL}")

    confirm = input("\nProceed with upload? (y/n): ").strip().lower()
    if confirm != 'y':
        print("❌ Upload cancelled.")
        return

    # Set delay between uploads
    try:
        delay = float(input("Delay between uploads in seconds (default: 1.0): ").strip() or "1.0")
    except ValueError:
        delay = 1.0

    # Start bulk upload
    try:
        results = uploader.bulk_upload(file_paths, security_key, subdir_path, delay)

        # Print final results
        print("\n" + "=" * 60)
        print("📊 UPLOAD RESULTS")
        print("=" * 60)
        print(f"✅ Successful: {results['success_count']}/{results['total']}")
        print(f"❌ Failed: {results['failure_count']}/{results['total']}")

        if results["failed"]:
            print("\n❌ Failed uploads:")
            for failed in results["failed"]:
                print(f"   • {Path(failed['file']).name}: {failed['error']}")

        if results["successful"]:
            print(f"\n✅ Successfully uploaded {results['success_count']} files to '{subdir_path}' category!")

    except KeyboardInterrupt:
        print("\n⚠️ Upload interrupted by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")


if __name__ == "__main__":
    main()

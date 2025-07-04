import os
import re
import mimetypes

VALID_EXTENSIONS: set = {'.mp3', '.m4a', '.wav', '.ogg'}

def list_all_files_lv1(target_dir: str):
    target_dir_path = os.path.join(os.getcwd(), target_dir)

    all_files = {}
    all_subdirs = [
        name for name in os.listdir(target_dir_path)
        if os.path.isdir(os.path.join(target_dir_path, name))
    ]

    for subdir in all_subdirs:
        subdir_path = os.path.join(target_dir_path, subdir)
        files = [
            f for f in os.listdir(subdir_path)
            if os.path.isfile(os.path.join(subdir_path, f)) and os.path.splitext(f)[1] in VALID_EXTENSIONS
        ]
        all_files[subdir] = files

    return all_files


def make_title_from_filename(filename: str) -> str:
    """
    Convert a filename into a title.

    This function removes the extension from the filename, splits the base name
    on common separators (+, -, _, or space), capitalizes each word, and joins them
    with spaces.

    Args:
        filename: The filename to convert (e.g., 'abc-def_ghi.mp3').

    Returns:
        A title-cased string (e.g., 'Abc Def Ghi').
    """
    # Extract the base name without directory path
    base = os.path.basename(filename)
    # Remove the file extension
    name, _ = os.path.splitext(base)
    # Split on separators +, -, _, or space
    parts = re.split(r"[\+\-\_ ]+", name)
    # Capitalize each part and filter out empty strings
    title_words = [part.capitalize() for part in parts if part]
    # Join with a single space
    return " ".join(title_words)


def get_mediatype_from_filename(filename: str) -> str:
    extension = os.path.splitext(filename)[1].lower().strip('.')

    custom_map = {
        'aac': 'audio/aac',
        'flac': 'audio/flac',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'm4a': 'audio/mp4',
        'mp3': 'audio/mpeg',
        'mp4': 'audio/mp4',
        'wma': 'audio/x-ms-wma'
    }

    if extension in custom_map:
        return custom_map[extension]

    # fallback if needed
    # ----------------------
    mimetypes.init()

    # guess type; guess_type returns (type, encoding)
    media_type, _ = mimetypes.guess_type(filename)

    return media_type or 'application/octet-stream'

def get_directory_size(directory):
    """Calculate total size of directory in bytes"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            if os.path.isfile(filepath):
                total_size += os.path.getsize(filepath)
    return total_size

def main():
    mtype1 = get_mediatype_from_filename('audio.m4a')
    mtype2 = get_mediatype_from_filename('audio.mp3')
    print(mtype1, mtype2)

if __name__ == '__main__':
    main()

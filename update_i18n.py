#!/usr/bin/env python3
import json
import os
from pathlib import Path

def update_about_body(text):
    """Update the about.body text to include robotics and subaquatic focus"""
    # Find the pattern and add the focus part only once
    original_phrase = "across industry and research environments"
    new_phrase = "across industry and research environments, now focused on robotics R&D and subaquatic systems"

    # Only replace if the original phrase is in the text and the new phrase isn't already there
    if original_phrase in text and new_phrase not in text:
        updated = text.replace(original_phrase, new_phrase)
        return updated
    return text

def process_file(file_path):
    """Process a single i18n JSON file"""
    print(f"\nProcessing {file_path}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Check if "about.body" exists and update it
    if "about.body" in data:
        original_text = data["about.body"]
        updated_text = update_about_body(original_text)

        if original_text != updated_text:
            print(f"  Updated about.body: added robotics and subaquatic focus")
            print(f"  Original: {original_text[:80]}...")
            print(f"  Updated: {updated_text[:80]}...")
            data["about.body"] = updated_text

            # Write back the file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  * File updated successfully")
        else:
            print(f"  * No changes needed - text already contains focus or was already updated")
    else:
        print(f"  WARNING: 'about.body' key not found in {file_path}")

    return data

def main():
    """Main function to process all i18n files"""
    i18n_dir = Path("assets/i18n")

    # Files to process
    files_to_process = [
        i18n_dir / "en.json",
        i18n_dir / "pt-BR.json",
        i18n_dir / "es-CO.json"
    ]

    print("Updating i18n files with robotics and subaquatic system focus...")

    for file_path in files_to_process:
        if file_path.exists():
            try:
                process_file(file_path)
            except Exception as e:
                print(f"  ERROR: Failed to process {file_path}: {e}")
        else:
            print(f"  WARNING: File not found: {file_path}")

    print("\n* Update complete!")

if __name__ == "__main__":
    main()
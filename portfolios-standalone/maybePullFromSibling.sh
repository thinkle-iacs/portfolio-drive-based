#!/bin/bash

# Define the source and target directories
source_dir="../portfolio-container-attached/"
target_dir="./"

# Define the ignore list file
ignore_file=".ignore-when-pulling"

# Create the ignore list file if it doesn't exist
touch "$ignore_file"

# Function to check if a file is in the ignore list
is_ignored() {
  local file="$1"
  grep -qFx "$file" "$ignore_file"
  return $?
}

# Function to add a file to the ignore list
add_to_ignore_list() {
  local file="$1"
  echo "$file" >> "$ignore_file"
  echo "Ignoring $file, listed in $ignore_file."
}

# Iterate through files in the source directory
for file in "$source_dir"/*; do
    # Exclude dot files
    if [[ $file == "$source_dir"/.* ]]; then
        continue
    fi

    # Check if the file is in the ignore list
    if is_ignored "$file"; then
        continue
    fi

    # Check if the file exists in the target directory
    sibling_file="$target_dir/$(basename "$file")"
    if [ -e "$sibling_file" ]; then
        # Compare the files
        if ! cmp -s "$file" "$sibling_file"; then
            # Files are different
            echo "Files $file and $sibling_file are different."
            read -p "Show diff? (y/n): " show_diff
            if [ "$show_diff" = "y" ]; then
                diff -u "$file" "$sibling_file"
            fi

            read -p "Copy $sibling_file to $file? (y/n/i): " copy_file
            if [ "$copy_file" = "y" ]; then
                cp "$sibling_file" "$file"
                echo "File $sibling_file copied to $file."
            elif [ "$copy_file" = "i" ]; then
              # Add the file to the ignore list
              add_to_ignore_list "$file"
            fi        
        fi
    else
        # Sibling file doesn't exist in the target directory
        read -p "File $sibling_file does not exist in the current directory. Copy it? (y/n/i): " copy_sibling
        if [ "$copy_sibling" = "y" ]; then
            cp "$file" "$sibling_file"
            echo "File $file copied to $sibling_file."
        elif [ "$copy_sibling" = "i" ]; then
            # Add the file to the ignore list
            add_to_ignore_list "$file"
        fi
    fi
done

#!/bin/bash

# Find all directories named 'migrations' but exclude virtual environment paths
find . -type d -name "migrations" | grep -v "/env\|/venv\|/.env" | while read migrations_dir; do
    echo "Processing: $migrations_dir"
    
    # Find all files in the migrations directory
    find "$migrations_dir" -type f | while read file; do
        # Keep __init__.py files, delete everything else
        if [[ "$(basename "$file")" != "__init__.py" ]]; then
            echo "Deleting: $file"
            rm "$file"
        else
            echo "Keeping: $file"
        fi
    done
done

echo "Migration files cleanup complete."
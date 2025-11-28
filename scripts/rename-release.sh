#!/bin/bash
# 重命名 release 文件为 kfc-* 格式

cd release

for file in kfc-cli-*; do
    if [ -f "$file" ]; then
        newname=$(echo "$file" | sed 's/kfc-cli-/kfc-/')
        mv "$file" "$newname"
        echo "✓ 重命名: $file -> $newname"
    fi
done

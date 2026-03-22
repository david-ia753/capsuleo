import subprocess
import os

files_to_restore = [
    {
        "sha": "b28711e74a87a221f75960098df29ea9741dc5f9",
        "path": "src/app/modules/ModuleList.tsx"
    },
    {
        "sha": "be6814fa89a42f89a42f89a42f89a42f89a42f89",
        "path": "src/app/dashboard/page.tsx"
    },
    {
        "sha": "16ec6ef6f5e5694c0072c7263c959451121d556c",
        "path": "src/app/dashboard/layout.tsx"
    }
]

def restore():
    # Ensure directories exist
    os.makedirs("src/app/dashboard", exist_ok=True)
    os.makedirs("src/app/modules", exist_ok=True)
    
    for item in files_to_restore:
        sha = item["sha"]
        path = item["path"]
        print(f"Restoring {path} using blob {sha}...")
        try:
            content = subprocess.check_output(["git", "cat-file", "-p", sha])
            with open(path, "wb") as f:
                f.write(content)
            print(f"Successfully restored {path}")
        except Exception as e:
            print(f"Failed to restore {path}: {e}")

if __name__ == "__main__":
    restore()

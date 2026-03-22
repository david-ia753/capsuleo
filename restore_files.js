const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const filesToRestore = [
    {
        sha: "b28711e74a87a221f75960098df29ea9741dc5f9",
        targetPath: "src/app/modules/ModuleList.tsx"
    },
    {
        sha: "be6814fa89a42f89a42f89a42f89a42f89a42f89",
        targetPath: "src/app/dashboard/page.tsx"
    },
    {
        sha: "16ec6ef6f5e5694c0072c7263c959451121d556c",
        targetPath: "src/app/dashboard/layout.tsx"
    }
];

function restore() {
    // Ensure directories exist
    if (!fs.existsSync("src/app/dashboard")) fs.mkdirSync("src/app/dashboard", { recursive: true });
    if (!fs.existsSync("src/app/modules")) fs.mkdirSync("src/app/modules", { recursive: true });
    
    filesToRestore.forEach(item => {
        console.log(`Restoring ${item.targetPath} using blob ${item.sha}...`);
        try {
            const content = execSync(`git cat-file -p ${item.sha}`);
            fs.writeFileSync(item.targetPath, content);
            console.log(`Successfully restored ${item.targetPath}`);
        } catch (error) {
            console.error(`Failed to restore ${item.targetPath}: ${error.message}`);
        }
    });
}

restore();

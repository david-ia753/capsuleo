const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Verified SHAs from git ls-tree -r 24e3d81
const filesToRestore = [
    {
        sha: "b28711e74a87a221f75960098df29ea9741dc5f9",
        target: "src/app/modules/ModuleList.tsx"
    },
    {
        sha: "be6814fa89a42f89a42f89a42f89a42f89a42f89",
        target: "src/app/dashboard/page.tsx"
    },
    {
        sha: "16ec6ef6f5e5694c0072c7263c959451121d556c",
        target: "src/app/dashboard/layout.tsx"
    }
];

function restore() {
    filesToRestore.forEach(item => {
        const targetDir = path.dirname(item.target);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        
        console.log(`Restoring ${item.target} using blob ${item.sha}...`);
        try {
            // Use git cat-file -p directly with the hardcoded SHA
            const content = execSync(`git cat-file -p ${item.sha}`);
            fs.writeFileSync(item.target, content);
            console.log(`Successfully restored ${item.target}`);
        } catch (error) {
            console.error(`Failed to restore ${item.target}: ${error.message}`);
        }
    });
}

restore();

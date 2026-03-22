const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const commit = "24e3d81";
const filesToRestore = [
    {
        source: "src/app/(portal)/modules/ModuleList.tsx",
        target: "src/app/modules/ModuleList.tsx"
    },
    {
        source: "src/app/(portal)/dashboard/page.tsx",
        target: "src/app/dashboard/page.tsx"
    },
    {
        source: "src/app/(portal)/dashboard/layout.tsx",
        target: "src/app/dashboard/layout.tsx"
    }
];

function restore() {
    filesToRestore.forEach(item => {
        const targetDir = path.dirname(item.target);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        
        console.log(`Restoring ${item.target} from ${commit}:${item.source}...`);
        try {
            // Use git show with quotes for the path
            const content = execSync(`git show ${commit}:"${item.source}"`);
            fs.writeFileSync(item.target, content);
            console.log(`Successfully restored ${item.target}`);
        } catch (error) {
            console.error(`Failed to restore ${item.target}: ${error.message}`);
        }
    });
}

restore();

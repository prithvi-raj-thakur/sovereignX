file_path = r'C:\sovereignX\frontend\src\components\sovereign\SovereignWorkspace.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Remove the multiple inserted modals and replace with the original closing
modal_regex = re.compile(r'      <FaceApprovalModal[\s\S]*?\}\n      />\n    </div>\n  \);\n\}')
content = modal_regex.sub('    </div>\n  );\n}', content)

# Now just append the modal strictly to the very end of the file, replacing the FINAL occurrence
content = content.rsplit('    </div>\n  );\n}', 1)
content = content[0] + """      <FaceApprovalModal
        isOpen={isFaceAuthOpen}
        codeSnippet={pendingCodeSnippet}
        onCancel={() => {
          setIsFaceAuthOpen(false);
          setPendingExecutionId(null);
        }}
        onApprove={async () => {
          setIsFaceAuthOpen(false);
          if (!pendingExecutionId) return;
          try {
            const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";
            await fetch(apiUrl + "/api/v1/approve-execution", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ execution_id: pendingExecutionId })
            });
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </div>
  );
}"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

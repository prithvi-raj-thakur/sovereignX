file_path = r'C:\sovereignX\frontend\src\components\sovereign\SovereignWorkspace.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if 'import FaceApprovalModal' not in content:
    content = content.replace("import ReactMarkdown", "import FaceApprovalModal from './FaceApprovalModal';\nimport ReactMarkdown")

# 2. Add state vars
if 'isFaceAuthOpen' not in content:
    state_block = """  const [simulateLowVRAM, setSimulateLowVRAM] = useState(false);
  const [showVramWarning, setShowVramWarning] = useState(true);
  const [isFaceAuthOpen, setIsFaceAuthOpen] = useState(false);
  const [pendingExecutionId, setPendingExecutionId] = useState<string | null>(null);
  const [pendingCodeSnippet, setPendingCodeSnippet] = useState<string>("");"""
    content = content.replace("  const [simulateLowVRAM, setSimulateLowVRAM] = useState(false);\n  const [showVramWarning, setShowVramWarning] = useState(true);", state_block)

# 3. Replace onClick handler
old_button_click = """                        <button 
                          onClick={async () => {
                            try {
                              const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";
                              await fetch(apiUrl + "/api/v1/approve-execution", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ execution_id: step.execution_id })
                              });
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="px-3 py-1.5 rounded bg-[#00A3FF]/20 border border-[#00A3FF]/50 text-[#00A3FF] text-[11px] font-mono hover:bg-[#00A3FF]/30 transition-colors"
                        >
                          Authorize Execution
                        </button>"""

new_button_click = """                        <button 
                          onClick={() => {
                            setPendingExecutionId(step.execution_id);
                            let snippet = "Code block waiting execution...";
                            const match = message.content?.match(/`(?:python)?\\s*([\\s\\S]*?)`/i);
                            if (match) snippet = match[1];
                            setPendingCodeSnippet(snippet);
                            setIsFaceAuthOpen(true);
                          }}
                          className="px-3 py-1.5 rounded bg-[#00A3FF]/20 border border-[#00A3FF]/50 text-[#00A3FF] text-[11px] font-mono hover:bg-[#00A3FF]/30 transition-colors"
                        >
                          Authorize Execution
                        </button>"""
content = content.replace(old_button_click, new_button_click)

# 4. Inject Modal
if '<FaceApprovalModal' not in content:
    modal_tag = """      <FaceApprovalModal
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
    # Replace the very last closing div and curly brace
    content = content.replace("    </div>\n  );\n}", modal_tag)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

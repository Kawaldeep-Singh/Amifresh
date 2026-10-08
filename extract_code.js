const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:/Users/Kawaldeep Singh/.gemini/antigravity-ide/brain/851768b5-bb73-487a-8767-f738bae5ded1/.system_generated/logs/transcript_full.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file' && tc.args.TargetFile && tc.args.TargetFile.includes('register') && tc.args.TargetFile.includes('page.tsx')) {
            if (tc.args.CodeContent && tc.args.CodeContent.includes('WebcamModal') || tc.args.CodeContent.includes('Address Details')) {
                fs.writeFileSync('C:/Users/Kawaldeep Singh/Desktop/Amifresh/restored_register.tsx', tc.args.CodeContent);
                console.log('Restored to restored_register.tsx');
                return;
            }
          }
        }
      }
    } catch (e) { }
  }
}

processLineByLine();

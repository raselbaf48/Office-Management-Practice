const fs = require('fs');
let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// I will extract the blocks using their EXACT KNOWN string content from generate_clean.cjs
let clean = fs.readFileSync('generate_clean.cjs', 'utf8');

const getVar = (name) => {
  let r = new RegExp('const ' + name + ' = `([\\s\\S]*?)`;');
  let m = clean.match(r);
  return m ? m[1] : '';
}

let topAndAppearance = current.substring(0, current.indexOf("{activeSection === 'cloudsync'"));

const newRenderEnd = `
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('temp_base.tsx', topAndAppearance + newRenderEnd);

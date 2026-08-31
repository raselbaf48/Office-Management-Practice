const fs = require('fs');
let file = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

// I need to cut out the junk between the first `)}` and the end of the file.
// The file should end with:
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

const startJunk = /          \)} \? <Smartphone/;
if (startJunk.test(file)) {
    const endGood = file.indexOf("          )} ? <Smartphone");
    if (endGood !== -1) {
        file = file.substring(0, endGood) + `        </div>
      </div>
    </div>
  );
};
`;
    }
}
fs.writeFileSync('src/components/SettingsModal.tsx', file, 'utf-8');

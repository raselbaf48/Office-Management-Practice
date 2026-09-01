const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');
const expected = `        onSignaturesUpdated={(prep, auth) => {
          setPreparedBy(prep);
          setAuthorizedBy(auth);
        }}
      />
    </div>
    </div>
  );
};`;
const idx = code.indexOf(expected);
console.log("Index of end block: ", idx);

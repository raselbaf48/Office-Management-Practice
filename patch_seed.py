import sys

with open('src/services/localDatabase.ts', 'r') as f:
    code = f.read()

target = """      } else {
        // Initial seed Firebase with initial airmen and assignments
        this.saveToFirebase(this.db);
        return true;
      }"""

replacement = """      } else {
        // Initial seed Firebase with initial airmen and assignments
        this.isFirebaseSyncing = false; // Allow the seed to push
        this.saveToFirebase(this.db);
        return true;
      }"""

if target in code:
    code = code.replace(target, replacement)
    print('Replaced seed block!')
else:
    print('Target not found!')

with open('src/services/localDatabase.ts', 'w') as f:
    f.write(code)

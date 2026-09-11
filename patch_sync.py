import sys

with open('src/services/localDatabase.ts', 'r') as f:
    code = f.read()

target = """        // If local is newer, push to Firebase instead of pulling
        // FIX: NEVER push from a completely fresh/empty local state to overwrite cloud data.
        // We determine if local is "fresh" by checking if activityHistory is completely empty, 
        // OR if airmen length is exactly the initial count but assignments are empty.
        const isLocalBasicallyEmpty = !this.db.activityHistory || this.db.activityHistory.length === 0;

        if (localTime > fbTime && !isLocalBasicallyEmpty) {
           this.saveToFirebase(this.db);
           return true;
        }"""

if target in code:
    code = code.replace(target, "")
    print('Replaced sync block!')
else:
    print('Target not found!')

with open('src/services/localDatabase.ts', 'w') as f:
    f.write(code)

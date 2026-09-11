import sys

with open('src/firebase.ts', 'r') as f:
    code = f.read()

target = """  // Check if we are in a testing environment (AI Studio)
  if (typeof window !== 'undefined' && window.location.hostname.includes('run.app')) {
    return 'SIMULATED';
  }"""

replacement = """  // Check if we are in a testing environment (AI Studio)
  if (typeof window !== 'undefined' && (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('ais-pre') || window.location.hostname.includes('localhost'))) {
    console.log("Testing environment detected: Write blocked.");
    return 'SIMULATED';
  }"""

if target in code:
    code = code.replace(target, replacement)
    print("Replaced in firebase.ts")
else:
    print("Target not found in firebase.ts")

# Add the exported function at the top of firebase.ts
if "export const isTestingEnvironment" not in code:
    import_block = "export const db = initializeFirestore"
    code = code.replace(import_block, """export const isTestingEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h.includes('ais-dev') || h.includes('ais-pre') || h.includes('localhost');
};

""" + import_block)

with open('src/firebase.ts', 'w') as f:
    f.write(code)


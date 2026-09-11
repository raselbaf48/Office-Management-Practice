import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_end = """              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}"""

new_end = """              )}
            </div>
          </div>
          )}
        </div>

        {/* Modal Footer */}"""

content = content.replace(old_end, new_end)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

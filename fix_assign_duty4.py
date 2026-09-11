import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Conditionally render personnel candidate list
old_list = """          {/* 4. Personnel Candidate List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">"""

new_list = """          {/* 4. Personnel Candidate List */}
          {(activeFlight !== 'All' || activeDutyCode !== '') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">"""

content = content.replace(old_list, new_list)

old_list_end = """                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>"""

new_list_end = """                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>"""

content = content.replace(old_list_end, new_list_end)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

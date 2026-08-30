const fs = require('fs');
let code = fs.readFileSync('src/components/IdacSettingsModal.tsx', 'utf8');

const faulty = `                      )}
                    </div>
                  ))
                )}
              </div>
          )}
        </div>
        {/* Footer */}`;

const fixed = `                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {/* Footer */}`;

code = code.replace(faulty, fixed);
fs.writeFileSync('src/components/IdacSettingsModal.tsx', code);

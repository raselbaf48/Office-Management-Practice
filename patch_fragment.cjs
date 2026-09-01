const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const target1 = `              ) : (
                <div className="overflow-x-auto my-3">`;
const replace1 = `              ) : (
                <>
                <div className="overflow-x-auto my-3">`;

code = code.replace(target1, replace1);

const target2 = `                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>`;
const replace2 = `                    )}
                  </tbody>
                </table>
              </div>
              </>
            </div>
          )}
        </div>`;

code = code.replace(target2, replace2);
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
console.log('Added fragment');

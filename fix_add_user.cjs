const fs = require('fs');
const file = 'src/components/UserManagementTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetSelectEnd = `              </select>
            </div>
          </div>`;

const replacementSelectEnd = `              </select>
              <button onClick={() => setIsAddingUser(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors whitespace-nowrap">
                Add New User
              </button>
            </div>
          </div>`;

content = content.replace(targetSelectEnd, replacementSelectEnd);

// Now I need to add the `isAddingUser && (...)` modal at the end of the return statement.
// The return ends with:
//         </>
//       )}
//     </div>
//   );
// };

const modalJSX = `
      {/* Add New User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">Add New User</h4>
            <div className="space-y-4">
              <input type="text" placeholder="BD No" value={newUser.bdNo} onChange={e => setNewUser({...newUser, bdNo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
              <input type="text" placeholder="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
              <input type="text" placeholder="Rank" value={newUser.rank} onChange={e => setNewUser({...newUser, rank: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
              <input type="text" placeholder="Mobile No" value={newUser.mobileNo} onChange={e => setNewUser({...newUser, mobileNo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <input type="text" placeholder="Password (Optional)" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsAddingUser(false)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleAddUser} disabled={!newUser.bdNo || !newUser.name} className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 transition-colors">Add User</button>
            </div>
          </div>
        </div>
      )}
`;

const targetEnd = `      )}
    </div>
  );
};`;

const replacementEnd = `      )}
${modalJSX}
    </div>
  );
};`;

content = content.replace(targetEnd, replacementEnd);
fs.writeFileSync(file, content);

const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');

const returnRegex = /return \([\s\S]*?}\);/g;

const correctReturn = `return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4">
            {isSuccess ? (
              <Unlock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-amber-600 dark:text-amber-500" />
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isResetMode ? 'Reset Admin Passcode' : 'Admin Access Required'}
          </h2>
          {!isResetMode && (
            <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wider">
              Enter secure passcode to continue
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 animate-fadeIn">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-bold">{errorMsg}</span>
          </div>
        )}

        <div className="w-full">
          {!isResetMode ? (
            <>
              <div className="mb-6">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  disabled={isSuccess || isVerifying || lockRemainingSec > 0}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                  placeholder="••••"
                  autoFocus
                  maxLength={10}
                />
                
                {lockRemainingSec > 0 && (
                  <div className="text-xs font-bold text-red-500 mt-2 animate-pulse">
                    Locked for {lockRemainingSec}s
                  </div>
                )}
                {attempts > 0 && lockRemainingSec === 0 && (
                  <div className="text-xs font-bold text-amber-500 mt-2">
                    Attempt {attempts} of 3
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleVerify}
                  disabled={!passcode || isSuccess || isVerifying || lockRemainingSec > 0}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify Passcode</span>}
                </button>
              </div>
              
              <button
                onClick={() => { setIsResetMode(true); setErrorMsg(''); }}
                className="mt-4 text-[11px] font-bold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline cursor-pointer"
              >
                Forgot Admin Passcode?
              </button>
            </>
          ) : (
            <form onSubmit={handleNextStep} className="w-full space-y-4 animate-fadeIn">
              {resetStep === 1 && (
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Step 1: User ID (BD No)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-bold font-mono">BD/</span>
                    </div>
                    <input
                      type="text"
                      value={resetBd}
                      onChange={(e) => setResetBd(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
                      placeholder="474455"
                      required
                      autoFocus
                    />
                  </div>
                </div>
              )}
              
              {resetStep === 2 && (
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Step 2: Full Name</label>
                  <input
                    type="text"
                    value={resetName}
                    onChange={(e) => setResetName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="e.g. Rasel"
                    required
                    autoFocus
                  />
                </div>
              )}

              {resetStep === 3 && (
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Step 3: Mobile Number</label>
                  <input
                    type="tel"
                    value={resetMobile}
                    onChange={(e) => setResetMobile(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="e.g. 01711223344"
                    required
                    autoFocus
                  />
                </div>
              )}

              {resetStep === 4 && (
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enter New Admin Passcode</label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all text-center tracking-widest text-lg"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Admin Passcode</label>
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all text-center tracking-widest text-lg"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={cancelReset}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>{resetStep === 4 ? 'Save Passcode' : 'Next'}</span>
                  {resetStep < 4 && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );`;

content = content.replace(/return \([\s\S]*$/, correctReturn + '\n};\n');
fs.writeFileSync('src/components/AdminPasscodeModal.tsx', content);

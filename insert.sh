awk '
/\{\/\* Official Export \/ Print Button \*\/\}/ {
    print "        {/* Add Disposal Button */}"
    print "        {(role === \047ADMIN\047 || role === \047SUPER_ADMIN\047) && ("
    print "          <button"
    print "            onClick={() => setShowAddDisposalModal(true)}"
    print "            className=\"flex items-center space-x-1.5 px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-sm shadow-lg shadow-rose-900/20 transition-all cursor-pointer ml-4\""
    print "            title=\"Add Disposal\""
    print "          >"
    print "            <UserMinus className=\"w-5 h-5\" />"
    print "            <span>Add Disposal</span>"
    print "          </button>"
    print "        )}"
    print "        {/* Signature Settings Button */}"
    print "        {(role === \047ADMIN\047 || role === \047SUPER_ADMIN\047) && ("
    print "          <button"
    print "            onClick={() => setShowSignatureModal(true)}"
    print "            className=\"flex items-center space-x-1.5 px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-black text-sm shadow-lg transition-all cursor-pointer ml-4\""
    print "            title=\"Signatures\""
    print "          >"
    print "            <PenTool className=\"w-5 h-5\" />"
    print "            <span>Signatures</span>"
    print "          </button>"
    print "        )}"
    print $0
    next
}
{ print }
' src/components/ParadeStateFormattedView.tsx > temp.tsx
mv temp.tsx src/components/ParadeStateFormattedView.tsx

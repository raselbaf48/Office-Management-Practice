import os
import re

# Since the user requested that "Assign Duty, Parade, PT , Nt Count State, Leave, TDY,Attatchment register e Edit er option Enable thakbe" for Admin.
# And they asked for "Sudhu Matro Nt Count State e Edit er option Enable thakbe" for Normal User.
# This means:
# NightCountStateView: editable by User, Admin, Super Admin. -> handled (all restrictions removed).
# Everything else: editable by Admin, Super Admin. -> Currently it's checked with `(role === 'ADMIN' || role === 'SUPER_ADMIN')`.
# This perfectly matches the requirement for "Admin er access: ... e Edit er option Enable thakbe".
# The user wants normal User to NOT have edit access on those pages, and only on Nt Count State.
# So I should leave the `(role === 'ADMIN' || role === 'SUPER_ADMIN')` on ParadeState, MonthlyDuty, Leave, TDY, etc.

# The user also asked to make sure Admin flight is included in the duty ratio matrix, which I did.
print("Role checks are fine.")

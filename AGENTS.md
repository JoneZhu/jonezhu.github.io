# Repository workflow

- After completing any user-requested article, content, configuration, or code change, run the relevant validation, create a Git commit, and push the current branch to its configured remote by default.
- Do not wait for the user to separately request `commit` or `push`.
- If the user explicitly says not to commit, not to push, or asks to review the changes first, follow that instruction instead.
- Stage and commit only files related to the current task. Preserve unrelated user changes in the working tree.
- For blog content changes, run `npm run build` before committing.

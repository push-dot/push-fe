# ToolLine

One step the agent took, with its result underneath (⎿).

- Dot colour is the state: `green` done, `t3` blinking running, `red` failed, `orange` waiting for approval.
- First line: the action in bold + its target in `t3`. Second line: the result in plain words, numbers where possible ("필수 5개 · 우대 3개"). Long results collapse with "+6줄".
- Failures say what failed and why, in `red`, and are followed by a choice of what to do next.

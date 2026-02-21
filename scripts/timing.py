import time

class Timer:
    def __init__(self):
        self._starts: dict[str, float] = {}
        self._durations: dict[str, float] = {}
        self.start("total")

    def start(self, name: str):
        self._starts[name] = time.time()

    def stop(self, name: str) -> float:
        d = time.time() - self._starts.get(name, time.time())
        self._durations[name] = d
        return d

    def get(self, name: str) -> float:
        return self._durations.get(name, 0.0)

    def report(self) -> str:
        self.stop("total")
        total = self._durations.get("total", 0)

        # Group: top-level phases first, then sub-timings indented
        top = ["setup", "verify", "homepage", "tasks", "execute", "fix"]
        sub_prefix = {
            "tasks": ["skeleton", "frontend_gen", "backend_gen"],
        }

        lines = [
            "",
            "╔══════════════════════════════════╗",
            "║       /ship — timing report      ║",
            "╠══════════════════════════════════╣",
        ]
        for name in top:
            d = self._durations.get(name, 0)
            if d == 0:
                continue
            label = name.replace("_", " ").capitalize()
            lines.append(f"║  {label:<22s} {d:>5.1f}s ║")
            # Sub-timings
            for sub in sub_prefix.get(name, []):
                sd = self._durations.get(sub, 0)
                if sd > 0:
                    slabel = sub.replace("_", " ")
                    lines.append(f"║    └ {slabel:<18s} {sd:>5.1f}s ║")

        lines.append(f"╠══════════════════════════════════╣")
        lines.append(f"║  {'Total':<22s} {total:>5.1f}s ║")
        lines.append(f"╚══════════════════════════════════╝")

        return "\n".join(lines)

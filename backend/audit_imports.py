import ast
import importlib
from pathlib import Path

ROOT = Path("engine")

errors = []

for file in ROOT.rglob("*.py"):

    try:
        tree = ast.parse(
            file.read_text(
                encoding="utf8",
                errors="ignore",
            )
        )

    except Exception:
        continue

    for node in ast.walk(tree):

        if not isinstance(node, ast.ImportFrom):
            continue

        if not node.module:
            continue

        module = node.module

        if not module.startswith("engine"):
            continue

        try:

            mod = importlib.import_module(module)

        except Exception as e:

            errors.append(
                (
                    file,
                    module,
                    str(e),
                )
            )

            continue

        for alias in node.names:

            if alias.name == "*":
                continue

            if not hasattr(
                mod,
                alias.name,
            ):

                errors.append(
                    (
                        file,
                        module,
                        f"missing symbol: {alias.name}",
                    )
                )

print()
print("=" * 80)
print("BROKEN IMPORTS")
print("=" * 80)

for e in errors:

    print()
    print(e[0])
    print(" ->", e[1])
    print(" ->", e[2])

print()
print("TOTAL:", len(errors))
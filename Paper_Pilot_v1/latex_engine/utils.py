import re

def escape_latex(text: str) -> str:
    if not text:
        return ""

    # Split on inline math ($...$) and display math ($$...$$)
    # We escape OUTSIDE math, leave INSIDE math untouched
    parts = re.split(r'(\$\$.*?\$\$|\$.*?\$)', text, flags=re.DOTALL)

    result = []
    for i, part in enumerate(parts):
        if part.startswith('$'):
            # Math region — pass through as-is
            result.append(part)
        else:
            # Normal text — escape special chars
            replacements = [
                ("\\", r"\textbackslash{}"),
                ("&",  r"\&"),
                ("%",  r"\%"),
                ("#",  r"\#"),
                ("_",  r"\_"),
                ("{",  r"\{"),
                ("}",  r"\}"),
                ("~",  r"\textasciitilde{}"),
                ("^",  r"\textasciicircum{}"),
            ]
            for char, replacement in replacements:
                part = part.replace(char, replacement)
            result.append(part)

    return "".join(result)
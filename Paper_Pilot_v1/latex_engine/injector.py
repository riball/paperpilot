from pathlib import Path
from .utils import escape_latex


def inject_content(template_path: str, content: dict) -> str:
    """
    Loads a LaTeX template and injects escaped content
    into predefined placeholders.
    """
    template = Path(template_path).read_text(encoding="utf-8")

    for key, value in content.items():
        placeholder = f"<<{key.upper()}>>"
        if "references" in content:
            import re
            refs = content["references"]
            # Split on reference numbers like "1." "2." etc and rejoin with line breaks
            refs = re.sub(r'\s+(\d+\.)\s+', r'\n\\noindent[\1] ', refs)
            content["references"] = refs
        template = template.replace(
            placeholder,
            escape_latex(value)
        )

    return template

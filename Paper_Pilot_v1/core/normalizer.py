SECTION_MAP = {
    # Title
    "title": "title",

    # Abstract
    "abstract": "abstract",

    # Keywords — IEEE calls them "index terms"
    "keywords": "keywords",
    "keyword": "keywords",
    "index terms": "keywords",
    "index term": "keywords",
    "key words": "keywords",

    # Authors
    "author": "authors",
    "authors": "authors",

    # Introduction
    "introduction": "introduction",
    "intro": "introduction",
    "background": "introduction",
    "overview": "introduction",

    # Related Work
    "related work": "related_work",
    "literature review": "related_work",
    "prior work": "related_work",

    # Methodology
    "methodology": "methodology",
    "method": "methodology",
    "methods": "methodology",
    "approach": "methodology",
    "proposed method": "methodology",
    "system design": "methodology",
    "proposed approach": "methodology",

    # Results
    "results": "results",
    "result": "results",
    "experiments": "results",
    "experiment": "results",
    "evaluation": "results",
    "discussion": "results",
    "experimental results": "results",
    "findings": "results",

    # Conclusion
    "conclusion": "conclusion",
    "conclusions": "conclusion",
    "concluding remarks": "conclusion",
    "summary": "conclusion",
    "future work": "conclusion",

    # References
    "references": "references",
    "reference": "references",
    "bibliography": "references",
}

EXPECTED_SECTIONS = [
    "title",
    "abstract",
    "keywords",
    "introduction",
    "methodology",
    "results",
    "conclusion",
    "references"
]

def normalize_section_name(name: str):
    return SECTION_MAP.get(name.lower().strip(), None)
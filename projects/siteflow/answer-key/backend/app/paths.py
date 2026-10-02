"""Find the SiteFlow folder no matter how deep this file sits."""

from pathlib import Path


def siteflow_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "data" / "sample" / "materials.csv"
        if candidate.exists():
            return parent
    raise FileNotFoundError("Could not find data/sample/materials.csv")

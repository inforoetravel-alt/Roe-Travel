import os

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "_template.html")

# (name, slug, needs_article)
COUNTRIES = [
    ("United States", "united-states", True),
    ("Canada", "canada", False),
    ("United Kingdom", "united-kingdom", True),
    ("France", "france", False),
    ("Italy", "italy", False),
    ("Spain", "spain", False),
    ("Germany", "germany", False),
    ("Australia", "australia", False),
    ("United Arab Emirates", "united-arab-emirates", True),
    ("Japan", "japan", False),
    ("China", "china", False),
    ("Belgium", "belgium", False),
    ("Saudi Arabia", "saudi-arabia", False),
    ("Hong Kong", "hong-kong", False),
    ("Netherlands", "netherlands", False),
    ("Switzerland", "switzerland", False),
    ("Singapore", "singapore", False),
    ("Nigeria", "nigeria", False),
    ("South Africa", "south-africa", False),
    ("Ghana", "ghana", False),
    ("Morocco", "morocco", False),
    ("Egypt", "egypt", False),
    ("Kenya", "kenya", False),
    ("Denmark", "denmark", False),
    ("Sweden", "sweden", False),
    ("Norway", "norway", False),
    ("Finland", "finland", False),
    ("Portugal", "portugal", False),
    ("Turkey", "turkey", False),
]

def build(name, slug, needs_article):
    display = f"the {name}" if needs_article else name
    with open(TEMPLATE_PATH, encoding="utf-8") as f:
        html = f.read()
    html = (html
        .replace("{{DISPLAY_NOARTICLE}}", name)
        .replace("{{DISPLAY}}", display)
        .replace("{{NAME}}", name)
        .replace("{{SLUG}}", slug))
    out_path = os.path.join(os.path.dirname(__file__), f"{slug}.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", out_path)

if __name__ == "__main__":
    for name, slug, needs_article in COUNTRIES:
        build(name, slug, needs_article)

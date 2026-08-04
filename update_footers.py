import os
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine relative prefix based on path
    is_in_pages = filepath.startswith('pages/') or filepath.startswith('pages\\')
    prefix = "" if is_in_pages else "pages/"

    privacy_url = f"{prefix}privacy.html"
    terms_url = f"{prefix}terms.html"

    privacy_col = f"""
      <div class="footer-col">
        <h3>Privacy</h3>
        <ul>
          <li><a href="{privacy_url}">Privacy Policy</a></li>
          <li><a href="{terms_url}">Terms of Service</a></li>
        </ul>
      </div>"""

    # Check if Privacy block already exists to avoid duplicate insertions
    if '<h3>Privacy</h3>' in content:
        print(f"Privacy column already exists in {filepath}. Skipping.")
        return False

    # Regex to find the Quick Links block
    pattern = r'(<div class="footer-col">\s*<h3>Quick Links</h3>.*?</div>)'
    match = re.search(pattern, content, re.DOTALL)

    if not match:
        print(f"Could not find Quick Links footer column in {filepath}.")
        return False

    quick_links_block = match.group(1)
    replacement = quick_links_block + privacy_col

    updated_content = content.replace(quick_links_block, replacement)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print(f"Successfully updated footer in {filepath}")
    return True

def main():
    html_files = []
    # Find all HTML files in current dir and pages/
    for root, dirs, files in os.walk('.'):
        # Ignore some dirs if needed
        if '.git' in root or 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    for filepath in html_files:
        # Normalize path
        normalized_path = os.path.relpath(filepath, '.')
        update_file(normalized_path)

if __name__ == "__main__":
    main()

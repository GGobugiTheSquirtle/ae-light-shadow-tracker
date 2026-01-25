"""
Another Eden Wiki Scraper v4
Guiding Light / Luring Shadow 데이터 추출
"""

import requests
from bs4 import BeautifulSoup
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

URLS = {
    'guiding-light': 'https://anothereden.wiki/w/Guiding_Light',
    'luring-shadow': 'https://anothereden.wiki/w/Luring_Shadow'
}

WEAPON_TYPES = ['Ax', 'Bow', 'Fists', 'Hammer', 'Katana', 'Lance', 'Staff', 'Sword']


def fetch_page(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.text


def parse_entry_li(li):
    """<li> 태그에서 엔트리 정보 추출"""
    # 아이콘 추출
    img = li.find('img')
    icon = None
    if img:
        alt = img.get('alt', '')
        if alt:
            icon = alt.replace(' ', '_')

    # 전체 텍스트 - 공백 구분자로 추출
    text = li.get_text(separator=' ', strip=True)

    # (x N) 또는 (xN) 패턴으로 개수 추출 - 공백 허용
    qty_match = re.search(r'\(x\s*(\d+)\s*\)\s*$', text)
    if qty_match:
        qty = int(qty_match.group(1))
        label = text[:qty_match.start()].strip()
    else:
        qty = 1
        label = text

    # 맨 앞 콜론/대시 제거
    label = re.sub(r'^[\s:\-]+', '', label)

    # 콜론 앞 제거 (아이콘 alt 텍스트일 수 있음)
    if ':' in label:
        parts = label.split(':', 1)
        # 짧은 부분이 앞에 있고 .png가 포함되어 있으면 아이콘 이름
        if len(parts[0]) < 25 and '.png' in parts[0].lower():
            label = parts[1].strip()

    # 맨 앞 콜론/대시 다시 제거
    label = re.sub(r'^[\s:\-]+', '', label)

    if not label or len(label) < 3:
        return None

    return {
        'label': label,
        'icon': icon,
        'quantity': qty
    }


def parse_obtain_cell(cell):
    """Obtain 셀에서 획득처 정보 추출"""
    sources = []

    # 모든 ul 가져오기
    all_uls = cell.find_all('ul')

    for ul in all_uls:
        # 이 ul의 직접 자식 li들
        for li in ul.find_all('li', recursive=False):
            li_text = li.get_text(strip=True)

            # "Obtain from" 헤더는 건너뛰기
            if li_text.startswith('Obtain from'):
                continue

            # "Badge Trading"만 있는 li는 건너뛰기 (링크만 있고 하위 ul 없음)
            if li_text == 'Badge Trading':
                continue

            # 소스 링크 찾기
            source_link = li.find('a')
            if not source_link:
                continue

            source_name = source_link.get_text(strip=True)

            # 무기 링크는 건너뛰기
            if any(f'({w})' in source_name for w in WEAPON_TYPES):
                continue

            # 빈 이름 건너뛰기
            if not source_name or source_name == 'Badge Trading':
                # Badge Trading 아래의 실제 소스인지 확인
                next_link = li.find_all('a')
                if len(next_link) > 1:
                    source_link = next_link[1]
                    source_name = source_link.get_text(strip=True)
                else:
                    continue

            # 소스 개수 추출 - 링크 바로 뒤 텍스트에서
            # "The 1000 Year Ark of the Ocean Palace(x10)"
            count_match = re.search(re.escape(source_name) + r'\s*\(x(\d+)\)', li_text)
            source_count = int(count_match.group(1)) if count_match else 0

            source_data = {
                'name': source_name,
                'count': source_count,
                'entries': []
            }

            # 하위 ul에서 엔트리 추출
            sub_ul = li.find('ul')
            if sub_ul:
                for entry_li in sub_ul.find_all('li', recursive=False):
                    entry = parse_entry_li(entry_li)
                    if entry:
                        source_data['entries'].append(entry)

            # 엔트리가 있는 소스만 추가
            if source_data['entries']:
                sources.append(source_data)

    return sources


def parse_wiki_table(html, item_type):
    """위키 테이블 파싱"""
    soup = BeautifulSoup(html, 'html.parser')
    content = soup.find('div', class_='mw-parser-output')

    if not content:
        return []

    table = content.find('table', class_='wikitable')
    if not table:
        return []

    results = []
    rows = table.find_all('tr')[1:]

    for row in rows:
        cells = row.find_all('td')
        if len(cells) < 4:
            continue

        name_cell = cells[1]
        name_link = name_cell.find('a')
        if not name_link:
            continue

        name_text = name_link.get_text(strip=True)
        weapon_match = re.search(r'\((\w+)\)', name_text)
        if not weapon_match:
            continue

        weapon_type = weapon_match.group(1)

        obtain_cell = cells[3]
        obtain_text = obtain_cell.get_text(strip=True)

        total_match = re.search(r'Obtain from:\s*\(x(\d+)\)', obtain_text)
        total = int(total_match.group(1)) if total_match else 0

        sources = parse_obtain_cell(obtain_cell)

        results.append({
            'weapon': weapon_type,
            'total': total,
            'sources': sources
        })

    return results


def generate_markdown(data, item_type):
    """데이터를 마크다운 형식으로 변환"""
    item_name = item_type.replace('-', ' ').title()
    lines = [f"# {item_name}\n"]

    for weapon_data in data:
        weapon = weapon_data['weapon']
        total = weapon_data['total']

        lines.append(f"\n## {item_name} ({weapon}) = {total}\n")

        for source in weapon_data['sources']:
            source_name = source['name']
            source_count = source['count']

            lines.append(f"- {source_name} ({source_count})")

            for entry in source['entries']:
                label = entry['label']
                icon = entry['icon'] or 'None'
                qty = entry['quantity']

                lines.append(f"  - {label}: {icon}, {qty}")

        lines.append("")

    return '\n'.join(lines)


def main():
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(output_dir, exist_ok=True)

    for item_type, url in URLS.items():
        print(f"\n{'='*50}")
        print(f"Scraping: {item_type}")
        print(f"URL: {url}")
        print('='*50)

        try:
            html = fetch_page(url)
            print(f"Page fetched: {len(html)} bytes")

            data = parse_wiki_table(html, item_type)
            print(f"Parsed {len(data)} weapon types")

            total_entries = 0
            for wd in data:
                entries = sum(len(s['entries']) for s in wd['sources'])
                total_entries += entries
                print(f"  - {wd['weapon']}: total={wd['total']}, sources={len(wd['sources'])}, entries={entries}")

            print(f"Total entries: {total_entries}")

            md_content = generate_markdown(data, item_type)

            output_file = os.path.join(output_dir, f'{item_type}.md')
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(md_content)

            print(f"Saved to: {output_file}")

            print("\n--- Preview ---")
            print('\n'.join(md_content.split('\n')[:50]))

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()


if __name__ == '__main__':
    main()

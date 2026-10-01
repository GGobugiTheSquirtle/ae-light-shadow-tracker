"""
Another Eden 체크리스트 번역기
Gemini 2.5 Flash API 활용
"""

import json
import os
import re
import time
from google import genai

# API 설정
API_KEY = os.environ["GEMINI_API_KEY"]  # 2026-10-02 — 하드코딩 키 제거, env 사용
client = genai.Client(api_key=API_KEY)
MODEL = "gemini-2.5-flash-preview-05-20"

# 번역 프롬프트
TRANSLATION_PROMPT = """당신은 모바일 게임 "어나더에덴(Another Eden)" 전문 번역가입니다.

## 번역 규칙

1. **고유명사는 영어 유지**
   - 캐릭터 이름: Aldo, Feinne, Cyrus 등
   - 지역명: Nilva, Elzion, Baruoki 등
   - 던전명: Miglance Castle, Snake Liver Damaku 등
   - 아이템 고유명: Atlantis Pearls, Chaos Fragment 등

2. **게임 용어 한국어 번역**
   - Collect → 수집
   - Obtain → 획득
   - Defeat → 처치
   - Clear → 클리어
   - Chest → 상자
   - Reward → 보상
   - Chapter → 챕터
   - Hard/Very Hard → Hard/Very Hard (그대로)
   - Badge Trading → 배지 교환

3. **획득처/콘텐츠명 번역 참고**
   - Another Dungeon → 어나더 던전
   - Phantom Crystal Dimension → 환리경
   - Astral Archive → 성영의 서가
   - Main Story → 메인 스토리

4. **형식**
   - 자연스러운 한국어 문장
   - 간결하게 유지
   - 숫자와 단위는 그대로

## 입력
아래 텍스트들을 번역해주세요. JSON 배열 형식으로 입력됩니다.

## 출력
번역된 텍스트를 같은 순서의 JSON 배열로 반환하세요.
다른 설명 없이 JSON 배열만 출력하세요.

입력:
{texts}
"""


def load_md_file(filepath):
    """MD 파일에서 텍스트 추출"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 엔트리 라벨 추출 (- 로 시작하는 하위 항목)
    entries = []
    for line in content.split('\n'):
        # "  - Label: icon, qty" 형식
        match = re.match(r'^  - (.+?):\s*\S+,\s*\d+$', line)
        if match:
            entries.append(match.group(1))

    return list(set(entries))  # 중복 제거


def translate_batch(texts, batch_size=100):
    """배치로 번역 (API 호출 최소화)"""
    all_translations = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        print(f"Translating batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1} ({len(batch)} items)")

        prompt = TRANSLATION_PROMPT.format(texts=json.dumps(batch, ensure_ascii=False))

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=MODEL,
                    contents=prompt,
                )

                # JSON 파싱
                result_text = response.text.strip()
                # 코드 블록 제거
                if result_text.startswith('```'):
                    result_text = re.sub(r'^```\w*\n?', '', result_text)
                    result_text = re.sub(r'\n?```$', '', result_text)

                translations = json.loads(result_text)
                all_translations.extend(translations)

                print(f"  Got {len(translations)} translations")
                break

            except Exception as e:
                print(f"  Attempt {attempt+1} Error: {e}")
                if attempt < max_retries - 1:
                    wait_time = 60 * (attempt + 1)
                    print(f"  Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    # 실패시 원본 유지
                    print(f"  Failed, keeping original")
                    all_translations.extend(batch)

        # Rate limiting
        time.sleep(2)

    return all_translations


def create_translation_map(originals, translations):
    """번역 맵 생성"""
    return dict(zip(originals, translations))


def update_md_file(filepath, translation_map, output_path):
    """MD 파일 번역 적용"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 각 엔트리 라벨 번역
    for original, translated in translation_map.items():
        # "  - Original: icon, qty" -> "  - Translated: icon, qty"
        pattern = re.compile(r'^(  - )' + re.escape(original) + r'(:\s*\S+,\s*\d+)$', re.MULTILINE)
        # 번역된 텍스트의 백슬래시 이스케이프
        safe_translated = translated.replace('\\', '\\\\')
        content = pattern.sub(r'\1' + safe_translated + r'\2', content)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Saved: {output_path}")


def main():
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')

    # 1. 모든 고유 텍스트 수집
    all_texts = []
    for filename in ['guiding-light.md', 'luring-shadow.md']:
        filepath = os.path.join(data_dir, filename)
        if os.path.exists(filepath):
            texts = load_md_file(filepath)
            all_texts.extend(texts)
            print(f"Loaded {len(texts)} unique entries from {filename}")

    all_texts = list(set(all_texts))
    print(f"\nTotal unique texts to translate: {len(all_texts)}")

    # 2. 번역
    print("\n--- Starting translation ---")
    translations = translate_batch(all_texts)

    # 3. 번역 맵 생성
    translation_map = create_translation_map(all_texts, translations)

    # 4. 번역 맵 저장 (디버깅/참고용)
    map_path = os.path.join(data_dir, 'translations.json')
    with open(map_path, 'w', encoding='utf-8') as f:
        json.dump(translation_map, f, ensure_ascii=False, indent=2)
    print(f"\nSaved translation map: {map_path}")

    # 5. MD 파일 업데이트
    print("\n--- Updating MD files ---")
    for filename in ['guiding-light.md', 'luring-shadow.md']:
        filepath = os.path.join(data_dir, filename)
        if os.path.exists(filepath):
            output_path = os.path.join(data_dir, f'{filename.replace(".md", "-ko.md")}')
            update_md_file(filepath, translation_map, output_path)

    print("\nDone!")


if __name__ == '__main__':
    main()

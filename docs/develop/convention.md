# Conventions

## Variable or Class Convention

대부분의 자바스크립트 컨벤션을 따릅니다.

- 가능하면 camelCase 를 선호합니다.
- 클래스는 첫문자를 대문자로 사용합니다.
- 글로벌 변수와 로컬 상수는 모두 UPPER_CASE 로 사용합니다.

## File name Convention

파일명은 snake_case 를 사용합니다. 물론 소문자입니다.

incorrect

```
fileName.html
file-name.html
```

correct

```
file_name.html  ( more preferred )
filename.html
```

## Branch Convention

브랜치 컨벤션이 있습니다.

그동안 혼자 작업할 때는 모든 것이 `feature/feature_name` 이었는데 이걸 조금 바꿔야 할 것 같습니다.

각 브랜치는 4 종류로 구분합니다.

- core
- module
- theme
- doc

입니다.

따라서 다음과 같이 브랜치를 분기해 사용해주세요.

`core/replace-module`

`module/chatting-system`

`theme/niki-blog`

`doc/install-guide`
 
## Commit subject Convention

커밋 제목의 규칙은 과거형으로 적습니다.

`added new theme`

`implemented awesome feature`

`removed unused`

`fixed memory leak`

커밋 설명의 첫 두 줄은 60~80 자 미만으로 적어주세요. 한글일 경우 40자 미만이 좋습니다. 세번째 줄 다음은 한 줄 띄우고 필요한 설명을 적습니다.

```
근처에 있는 아무나 붙잡고 휴대폰 쥐어주면서 
사진 찍어달라고 부탁해보세요.
(빈줄)
99프로는 갤 노트 7 아니면 다 흔쾌히 찍어줍니다.
아, 나머지 1프로는 들고 튀죠.
```

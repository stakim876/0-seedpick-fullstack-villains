# API 명세

기본 주소는 `/api`. 요청과 응답 본문은 JSON이다. 날짜는 `YYYY-MM-DD`로 보낸다.

상태 값: `todo`, `doing`, `done`  
우선순위: `low`, `medium`, `high`

## 목록 조회

`GET /api/tasks?status=&q=&priority=`

`status`, `q`, `priority`는 생략할 수 있다.

```json
{
  "tasks": [
    {
      "id": "664f1c2a9b1e4c0011223344",
      "title": "로그인 화면 초안",
      "description": "이메일과 비밀번호 입력을 배치한다",
      "status": "doing",
      "priority": "high",
      "dueDate": "2026-10-16"
    }
  ]
}
```

## 추천

`GET /api/tasks/recommendations`

완료가 아니고, 우선순위가 높거나 마감일이 이틀 이내인 업무를 최대 3개 반환한다.

## 등록

`POST /api/tasks`

```json
{
  "title": "로그인 화면 초안",
  "description": "이메일과 비밀번호 입력을 배치한다",
  "priority": "high",
  "dueDate": "2026-10-16"
}
```

제목이 없으면 `400`과 `{ "message": "제목을 입력하세요." }`를 반환한다. 성공하면 생성된 업무와 `201`을 반환한다. 처음 상태는 `todo`다.

## 상세

`GET /api/tasks/:id`

없으면 `404`와 `{ "message": "업무를 찾을 수 없습니다." }`.

## 수정

`PATCH /api/tasks/:id`

보낸 필드만 바꾼다. 상태, 제목, 설명, 우선순위, 마감일을 받을 수 있다.

## 삭제

`DELETE /api/tasks/:id`

성공하면 `204`.

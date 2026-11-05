# BottomSheet

The way every choice, filter and picker opens. Content slides up over a `scrim`.

- iOS: floating glass sheet (`sheet` fill, blur 30px, `shadow-glass`), inset 8px from the edges, 40px corners. Android: full-width `bg` sheet with 28px top corners.
- Order: grab handle, `h2` title + one-line `b2` `t3` explanation + close button, the content, then one primary button.
- The title is a question the person answers ("어떤 공고와 비교할까요?"). The button names the result ("부족한 점 찾기"), not "확인".
- Lists that start something on tap (bookmarks, proposals) need no button.
- A sheet that holds a whole flow (계정, 요금제) opens almost full height and navigates inside itself with a back button.

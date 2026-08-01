# TicTacToe

A React Native Tic Tac Toe game on Expo Router — turn logic, win detection, running scores
persisted across app restarts, and an authenticated multi-screen flow.

**Stack:** React Native 0.86 · Expo 57 · Expo Router · React 19 · TypeScript · Redux Toolkit · AsyncStorage

## Running it

```bash
npm install
npm start          # then scan the QR code with Expo Go
npm run android
npm run ios
```

## How it is put together

```
app/
  _layout.tsx           root layout, store provider, auth gate
  (auth)/
    login.tsx
    register.tsx
    _layout.tsx         stack for the unauthenticated flow
  (tabs)/
    index.tsx           home
    game.tsx            the board
    stats.tsx           score history
    _layout.tsx         tab navigator for the authenticated flow
store/
  store.ts              configureStore, typed RootState/AppDispatch
  hooks.ts              typed useAppSelector / useAppDispatch
  gameSlice.ts          board, turn, win detection, scores, modal state
  authSlice.ts          session state
```

**Two decisions worth explaining:**

*Win detection is a lookup table, not conditional logic.* `WIN_LINES` enumerates the eight winning
index triples once; `checkWinner` walks them and returns both the winner and the winning line.
Returning the line as well as the winner is what lets the board highlight the three winning cells
without recomputing anything — the reducer already knows which they were.

*Routing is file-based with two route groups.* `(auth)` and `(tabs)` are Expo Router groups, so the
unauthenticated and authenticated flows are separate layouts rather than one navigator with
conditional screens. Redirecting on logout is a route change, not state juggling inside a single
tree.

*Scores survive restarts through AsyncStorage*, hydrated on mount and written on change, so the
stats tab reflects real history rather than a session counter.

## Known limitations

Single-device hot-seat only — there is no AI opponent and no networked multiplayer. Auth is local
rather than backed by a real service. The obvious next step is a minimax opponent, which is a
genuinely interesting problem in a reducer.

## License

MIT

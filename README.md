# Trefla Admin Panel(npm)


## Firebase

### Emulators
```bash
firebase emulators:start
```

### Deploy All
```node
firebase deploy 
```

### Deploy hosting only
```node
    firebase deploy --only hosting
```

### Deploy functions only
```node
    firebase deploy --only functions
```

### Fix lint issue on function

```node
npm run lint -- --fix
```
refered from
    https://github.com/prettier/eslint-plugin-prettier/issues/114#issuecomment-452329371

### Ports

- functions emulator: 5001
- firestore emulator: 8080
- hosting emulator: 5000


## Project Structure

- menu: constants/menu.js

- language: lang/locales/en_US.js

- Styles: assets/css/scss


# Trefla Admin Panel(npm)

## Authentication


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


## Data Structure

### notification type

 - admin_notifications "11": ID verification requests
 - admin notifications "12": ID Transfer request
 - admin_notifications "13": id changes


 - optional val
    30, 35, 36, 50, 51, 
 - type
    0:create, 1: update, 41, 42, 43
 - sender_id

 - time

 -noti_id

(51, 43) comment <br/>
(50, 43) comment


## Permissons

- notification, manage users, manage posts, comments, edit langaugae
- bug, report


## To-dos

- [done]delete id transfer: model not closed
- [done]transfer id: origin user must have card number
 
## Project Structure

- menu: constants/menu.js

- language: lang/locales/en_US.js

- Styles: assets/css/scss


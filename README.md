# ConnectLife Management Portal

## Uvod

ConnectLife Management Portal je interno spletno orodje, namenjeno zaposlenim v podjetju Hisense Europe za upravljanje konfiguracij, funkcionalnosti in vsebin aplikacije ConnectLife na različnih trgih.

Namen sistema je omogočiti upravljanje podatkov, ki vplivajo na delovanje mobilne aplikacije ConnectLife, brez potrebe po spremembah izvorne kode ali novi izdaji aplikacije.

## Opis problema

Aplikacija ConnectLife je prisotna na različnih trgih po svetu, kjer se lahko razlikujejo podprte funkcionalnosti, vsebine in poslovna pravila.

Zaradi tega je bila razvita spletna aplikacija ConnectLife Management Portal, ki zaposlenim omogoča samostojno upravljanje konfiguracij in vsebin preko centraliziranega uporabniškega vmesnika.

---

## Kazalo vsebine
 
- [Vizija projekta](#vizija-projekta)
- [Struktura projekta](#struktura-projekta)
- [Orodja, ogrodja in knjižnice](#orodja-ogrodja-in-knjižnice)
- [Namestitev in zagon](#namestitev-in-zagon)
- [Spremenljivke okolja](#spremenljivke-okolja)

---

## Vizija projekta

ConnectLife Management Portal omogoča ekipi upravljanje pametnih gospodinjskih aparatov platforme ConnectLife. Prek njega je mogoče konfigurirati in pregledovati aparate z uporabo Firebase Remote Config, nastavljati dostopnost funkcionalnosti po posameznih trgih ter imeti vpogled v uporabnike platforme. Nadzorna plošča omogoča spremljanje ključnih metrik in dogodkov v realnem času, vgrajen chatbot asistent pa nudi interaktivno pomoč znotraj portala. Za analitične potrebe je na voljo primerjalni pogled, ki omogoča primerjavo konfiguracij med trgi, ter možnost izvoza podatkov v Excel format. 

---
## Struktura projekta
 
```
CONNECTLIFE_APP/
├── .github/
├── ConnectLife-management/
│   ├── dist/
│   ├── functions/                        # Firebase Cloud Functions
│   │   ├── node_modules/
│   │   ├── .gitignore
│   │   ├── index.js
│   │   ├── package-lock.json
│   │   └── package.json
│   ├── node_modules/
│   ├── public/
│   │   ├── connectlife_logo.png
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── reports/                          # Modul za poročila
│   │   ├── .gitignore
│   │   ├── index.js
│   │   ├── package-lock.json
│   │   └── package.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── views/                    # Pogledi znotraj strani
│   │   │   │   ├── ChatBot.jsx
│   │   │   │   ├── Comparison.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Features.jsx
│   │   │   │   ├── GlobeView.jsx
│   │   │   │   └── SimpleViews.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   ├── config/                       # Konfiguracija in Remote Config
│   │   │   ├── authUsers.js
│   │   │   ├── remoteConfigConditions.js
│   │   │   ├── remoteConfigDevices.js
│   │   │   └── washerDryerParser.js
│   │   ├── data/                         
│   │   │   └── marketLocations.js
│   │   ├── hooks/                      
│   │   │   └── useRemoteConfigConditions.js
│   │   ├── pages/                        # Glavne strani
│   │   │   ├── EventsDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Markets.jsx
│   │   │   └── Users.jsx
│   │   ├── services/                     # Komunikacija z API-ji
│   │   │   └── updateRemoteConfig.js
│   │   ├── styles/                      
│   │   │   ├── pages/
│   │   │   │   ├── api.css
│   │   │   │   ├── comparison.css
│   │   │   │   ├── dashboard.css
│   │   │   │   ├── features.css
│   │   │   │   └── settings.css
│   │   │   ├── base.css
│   │   │   ├── components.css
│   │   │   └── layout.css
│   │   ├── utils/                        # Pomožne funkcije
│   │   │   ├── auditLog.js
│   │   │   ├── exportFeaturesToExcel.jsx
│   │   │   ├── helpers.jsx
│   │   │   └── parseFirebaseConditions.js
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   ├── main.jsx
│   │   └── Style.css
│   ├── .dockerignore
│   ├── .env                              
│   ├── .firebaserc
│   ├── .gitignore
│   ├── compose.yaml
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── firebase.json
│   ├── index.html
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
└── Prototip/
```
## Orodja, ogrodja in knjižnice
 
### Jedro
 
| Tehnologija | Verzija | Namen |
|---|---|---|
| [React](https://react.dev/) | ^18 | UI knjižnica |
| [Vite](https://vitejs.dev/) | ^5 | Build orodje in razvojni strežnik |
| [React Router DOM](https://reactrouter.com/) | ^6 | Navigacija med stranmi |
 
### Firebase
 
| Storitev | Namen |
|---|---|
| Firebase Auth | Avtentikacija uporabnikov |
| Firebase Remote Config | Upravljanje konfiguracij naprav in trgov |
| Firebase Firestore | Shramba podatkov (audit log, eventi) |
| Firebase Cloud Functions | Strežniška logika |
 
### UI in vizualizacija
 
| Knjižnica | Namen |
|---|---|
| [Three.js](https://threejs.org/) | 3D globus prikaz|
| [ExcelJS](https://github.com/exceljs/exceljs) | Izvoz podatkov v Excel |
 
### Razvojno okolje
 
| Orodje | Namen |
|---|---|
| ESLint | Statična analiza kode |
| Docker + nginx | Kontejnerizacija in produkcijski strežnik |
| Firebase CLI | Deploy Cloud Functions in hostinga |

## Namestitev in zagon
 
### Predpogoji
 
- **Node.js** `>= 18.x`
- **npm** `>= 9.x`
- **Firebase CLI** (za deploy): `npm install -g firebase-tools`
- **Docker** (opcijsko, za produkcijsko okolje)

### 1. Kloniranje repozitorija
 
```bash
git clone https://github.com/<org>/connectlife-app.git
cd connectlife-app/ConnectLife-management
```
 
### 2. Namestitev odvisnosti
 
```bash
npm install
```
 
### 3. Ustvarjanje `.env` datoteke
 
V mapi `ConnectLife-management/` ustvari datoteko `.env`:
 
```bash
cp .env.example .env
```
 
### 4. Zagon razvojnega strežnika
 
```bash
npm run dev
```
 
Aplikacija bo dostopna na [http://localhost:5173](http://localhost:5173).
 
### 5. Gradnja za produkcijo
 
```bash
npm run build
```
 
Izhodna mapa je `dist/`.
 
---
 
## Spremenljivke okolja
 
Datoteka `.env` mora vsebovati naslednje Firebase konfiguracijske vrednosti.
 
```env
# Firebase konfiguracija
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
 
> Vse spremenljivke morajo imeti predpono `VITE_`, da jih Vite izpostavi na strani odjemalca.
 
---
 
## Docker nameščanje
 
Portal vključuje `Dockerfile` in `compose.yaml` za produkcijsko nameščanje z nginx strežnikom.
 
### Zagon z Docker Compose
 
```bash
docker compose up --build
```
 
Aplikacija bo dostopna na [http://localhost:80](http://localhost:80).
 
### Samo Docker build
 
```bash
# Gradnja slike
docker build -t connectlife-management .
 
# Zagon kontejnerja
docker run -p 80:80 connectlife-management
```
 
### nginx konfiguracija
 
Datoteka `nginx.conf` je vključena v projekt in jo Docker samodejno uporabi. Konfigurirana je za SPA routing (vse zahteve preusmerja na `index.html`).
 
---
 
## Firebase Cloud Functions
 
Cloud Functions se nahajajo v mapi `functions/` in so ločena Node.js aplikacija.
 
### Namestitev odvisnosti
 
```bash
cd functions
npm install
```
 
### Deploy funkcij
 
```bash
firebase deploy --only functions
```
 
### Deploy celotnega projekta
 
```bash
firebase deploy
```
 
> Za deploy je potrebna prijava: `firebase login`
 
---

# ConnectLife Management Portal

## Uvod


ConnectLife Management Portal je interno spletno orodje, razvito za podjetje Hisense Europe, ki omogoča centralizirano upravljanje konfiguracij, funkcionalnosti in vsebin aplikacije ConnectLife na različnih trgih. Ker se potrebe in podprte funkcionalnosti med trgi razlikujejo, sistem zaposlenim omogoča samostojno upravljanje nastavitev preko enotnega uporabniškega vmesnika, brez poseganja v izvorno kodo ali potrebe po novi izdaji mobilne aplikacije.


---

## Vizija projekta

ConnectLife Management Portal omogoča ekipi upravljanje pametnih gospodinjskih aparatov platforme ConnectLife. Prek njega je mogoče konfigurirati in pregledovati aparate z uporabo Firebase Remote Config, nastavljati dostopnost funkcionalnosti po posameznih trgih ter imeti vpogled v uporabnike platforme. Nadzorna plošča omogoča spremljanje ključnih metrik in dogodkov v realnem času, vgrajen chatbot asistent pa nudi interaktivno pomoč znotraj portala. Za analitične potrebe je na voljo primerjalni pogled, ki omogoča primerjavo konfiguracij med trgi, ter možnost izvoza podatkov v Excel format. 

---

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

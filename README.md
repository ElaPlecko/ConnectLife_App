# ConnectLife Management App Portal

**UVOD**

Cilj projekta je vzpostaviti lahek, a robusten sistem, ki ekipi omogoča hitro prilagoditev tega, kaj je v aplikaciji prikazano in aktivno na posameznem trgu — brez potrebe po novi izdaji aplikacije.

**OPIS PROBLEMA**

ConnectLife aplikacija deluje na več trgih (državah/segmentih) z različnimi poslovnimi pravili, podprtimi funkcijami in vsebinami. Trenutna situacija zahteva novo izdajo aplikacije vsakič, ko želi ekipa spremeniti:

•	katere funkcije so aktivne za določen trg (npr. voice control, self-diagnostics, shopping list, WashDry sync)

•	vsebino FAQ, "Suggestions & ideas", receptov, člankov in nasvetov po trgu

•	zunanje povezave (npr. webshop linki) specifične za trg

To povzroča zamude, operativne stroške in tveganje neskladij med tem, kar aplikacija prikazuje, in tem, kar je dejansko na voljo na trgu.

**OBSEG**

•	Spletni (web) admin portal z avtentikacijo za ConnectLife Manager

•	Kreiranje/urejanje trgov in segmentov ter njihovih nastavitev

•	Feature gating: vklop/izklop funkcij po trgu (voice control, self-diagnostics, shopping list, WashDry sync, ...)

•	Upravljanje vsebin: FAQ, Suggestions & ideas, recepti, članki/tips po trgu

•	Upravljanje zunanjih linkov (webshop, support linki) per market

•	Config API (REST/JSON) — endpoint za mobilno aplikacijo

•	Demo pogled: side-by-side primerjava dveh trgov (Trg A vs Trg B)

•	POC koncept samodejne izbire trga: demo ideje "redirect po IP/državi"

**ARHITEKTURA**

Rešitev temelji na lahki tri-nivojski arhitekturi (3-tier), prilagojeni za POC obseg.

Layer 1 — Admin Portal (Frontend): React SPA, dostopen internemu osebju

Layer 2 — Backend API (Node.js / Python FastAPI): REST API za CRUD operacije in config generiranje

Layer 3 — Data Store: PostgreSQL za konfiguracije + optional S3/blob storage za JSON config file serving

Config Delivery: JSON config endpoint, ki ga ConnectLife app pobere ob zagonu (ali periodično)

**DEPLOYMENT IN INFRASTRUKTURA**

Vse komponente (frontend, backend, PostgreSQL) bodo v Docker containerjih na enem strežniku. 




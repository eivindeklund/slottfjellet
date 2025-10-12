<!-- markdownlint-disable -->
# Om hvordan endre disse sidene

## Om eleventy (bruk og opplasting)

Vi bruker eleventy for å slippe repetere biter med meny etc.  Den lager en
statisk site, men har templating for å gjøre det lett for oss å utvikle uten å
repetere mye overalt. Her er hvordan gjøre ting med siten for å
installere/bygge/laste opp; template-system og struktur er dokumentert nedenfor.

## Installere Eleventy

```shell
npm install @11ty/eleventy
```

## Bygge siten med Eleventy

```shell
$ npx @11ty/eleventy
```

Den skriver hele siten til  `_site`, akkurat som det skal lastes opp.  Bruk
`bin/deploy.sh` til å laste opp, den tar backups og sjekker at alt er i orden
før den laster opp.

### Start Eleventy webserver for utvikling

```shell
$ npx @11ty/eleventy
```

Siten blir tilgjengelig på http://localhost:8080/

## Publisher siten

Kjør

```shell
$ bin/deploy.sh
```

Denne vil sjekke at alt er oppdater, bygd riktig og du er på riktig git-branch,
ta en datert backup av den live siten lokalt (til _backup/) og laste den opp til
`slottsfjellet-backups` på hosting, og deretter laste opp.

## Biter som kopieres rundt

### Hvordan

Alle biter som kopieres rundt skal være merket med en kommentar som dette:

```html
<!-- <hva det er>.
 ORIGINAL i <orignalfil>
 KOPI i <annen fil>
 KOPI i <annen fil>

 Endre bare i ORIGINAL FIL, og kopier deretter ut til alle andre steder.
 Hvis du legger til en ny kopi, endre ORIGINAL FIL til å liste den nye filen
 som en ekstra KOPI.

 Kopier med denne kommentaren.
-->
```


Avslutt etter det kopierte med

```html
<!--- Slutt kopiert seksjon -->
```

### Nav-meny og hvordan legge til i den

Nav-menyen viser hvilken side som er aktiv via CSS; "linken" til den aktive
siden blir bold, svart og kan ikke klikkes på.

Dette fungerer via tre ting tilsammen:

* Hver side har en CSS-klasse `<side>-page` på `body` som sier hvilken side en er i.  For `ttt.html` (Tønsberg TableTop) er det `<body class="ttt-page">`, etc.
* Hver link i nav'en har en CSS-classe `<side>-link` som sier hvilken side den hører til.  For linken til `ttt.html` er det `<div class="nav-item gray-box ttt-link">`
* I style2.css er det en CSS-selektor som velger kombinasjonen `.<blah>-page .<blah>-link` og skifter stilen.

Alle disse må endres sammen hvis en skal legge til en ny side.  `index.html` og `style2.css` har merking med `ENDRE HER NÅR DU LEGGER TIL EN SIDE.`

Bakgrunn:

> Vi prøver unngå Javascript for å ikke måtte vedlikeholde noe komplisert.
>
> Per oktober 2025 har ikke ren CSS noe som lar oss gjøre dette med mindre
> repetisjon enn det ovenfor. :local-link er i draft men ikke implementert noe
> sted, og det er ingen måte å gjøre prefix match mellom to css-regler (så vi
> kan ikke matche foo-page og foo-link uten å liste det for hånd.)  Det kan evt
> endres via et template-system (f.eks. Jekyll) eller hvis det kommer nye
> CSS-selectorer.


## TODO

Vi burde migrere organiseringen av filer til en bra struktur for web-siter, f.eks.

https://www.njfamirm.ir/en/blog/eleventy-folder-structure-guide/

# Om hvordan endre disse sidene

## Jekyll-install

```shell
$ gem install jekyll
```

På Mac vil dette prøve installere som root; for å unngå dette må du installere ruby fra Homebrew først:

```shell
$ brew install ruby
```

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



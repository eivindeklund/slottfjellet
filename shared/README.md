# Misc work that can be done with 'shared'

## Convert a single 3" x 5" PDf to an A4 with whitespace, for easy print + cut

### Using pdfjam

```shell
pdfjam --nup 2x4 --paper a4paper --delta "10mm 10mm" input.pdf --outfile output.pdf
```

### Using cpdf

```shell
brew install cpdf
```

Duplicate your PDF: Since you want multiple copies of the same page, first create a multi-page PDF with 4 copies of your file:

```shell
cpdf -merge input.pdf input.pdf input.pdf input.pdf -o 4copies.pdf
```

Impose onto A4: Use the nup command to arrange them 2x2 on an A4 sheet:

```shell
cpdf -nup 2x2 4copies.pdf -paper a4 -o final_to_print.pdf
```

This will automatically leave a small amount of whitespace because two 3"
widths (6") and two 5" heights (10") are smaller than A4 dimensions (8.27" x
11.69").


i've got a 3" x 5" PDF that I'd like to print as many times as possible on an
A4 page, spaced out so I have whitespace around it if possible. What's the
easiest way to do this on a Mac, without paying for it? I'm comfortable using
the command line.  Ideally, I'd also like to add some marks outside the PDF for
cutting (while keeping the card size 3"x5"):  Right angle marks "pointing at
the corner" in each corner, and marks at middle on the short edge, and 3 marks
along the long edge (1/4, middle, 3/4).


# Create and activate a venv inside your project folder
python3 -m venv venv
source venv/bin/activate

# Now pip and python3 are perfectly matched
pip install pypdf reportlab

python3 tile_cards.py input.pdf output.pdf

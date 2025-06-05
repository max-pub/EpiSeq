

for svg in $1/*.svg; do
	rsvg-convert --format=pdf --keep-aspect-ratio $svg > $svg.pdf
done


rsvg-convert -f pdf -o $1/combined.pdf $1/*.svg


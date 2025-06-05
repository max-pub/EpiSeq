# find $1 -name '*.svg' -exec rsvg-convert --format=pdf --keep-aspect-ratio {} > {}.pdf  \;

for svg in $(find $1 -type f -name *.svg); do
	echo $svg
	rsvg-convert --format=pdf --keep-aspect-ratio $svg > $svg.pdf
done

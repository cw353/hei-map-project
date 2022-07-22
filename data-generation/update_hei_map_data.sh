#!/bin/sh

dateOfUpdate=$( date "+%d %b %Y" )
scriptName="update_hei_map_data.sh"
updatedFiles="../data/business-licenses/business_license_data.js ../data/city-owned/city_owned_data.js ../data/crime/crime_data.js ../data/geojson/school_locations.js ../data/misc/misc.js ../data/misc/individual_properties.js"

echo "----------------------------------" && \
echo "running ""$scriptName"" on ""$dateOfUpdate" && \
echo "checking out hei-map-project gh-pages branch" && \
echo "----------------------------------" && \
git checkout gh-pages && \
git pull && \
echo "----------------------------------" && \
echo "running Python script to update data" && \
echo "----------------------------------" && \
python3 ./update_hei_map_data.py && \
echo "----------------------------------" && \
echo "updating hei-map-project gh-pages branch" && \
echo "----------------------------------" && \
git add $updatedFiles && \
git commit -m "automatic data update on ""$dateOfUpdate"" using ""$scriptName" && \
git push && \
echo "----------------------------------" && \
echo "updating hei-map-project main branch" && \
echo "----------------------------------" && \
git checkout main && \
git pull && \
git checkout gh-pages $updatedFiles && \
git commit -m "automatic data update on ""$dateOfUpdate"" using ""$scriptName" && \
git push && \
echo "----------------------------------" && \
echo "end of script" && \
echo "----------------------------------"

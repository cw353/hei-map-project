# Author: Claire Wagner
# Purpose: To generate data for the HEI map.

import pandas as pd
import urllib.parse
import datetime
import json
from collections import OrderedDict

def main():

	limit = 3000000
	city_owned_api_info = { "domain" : "https://data.cityofchicago.org", "dataset" : "aksk-kvfp" }
	properties_api_info = { "domain" : "https://datacatalog.cookcountyil.gov", "dataset" : "c49d-89sn" }
	business_licenses_api_info = { "domain" : "https://data.cityofchicago.org", "dataset" : "uupf-x98q" }
	ward_offices_api_info = { "domain" : "https://data.cityofchicago.org", "dataset" : "htai-wnw4" }
	school_locations_api_info = { "domain" : "https://data.cityofchicago.org", "dataset" : "vfmh-nkyk" }
	crimes_api_info = { "domain" : "https://data.cityofchicago.org", "dataset" : "x2n5-8w5q" }

	# Generate attribution string that gives the URLs and the access date and time for the data sources.
	fetchtime = datetime.datetime.now(datetime.timezone.utc).strftime("%d %b %Y")

	def makeAPIRequest(api_endpoint, params, limit, read_function):
		"""Helper function to make Socrata API request."""
		query = "?"
		if len(params) > 0:
			query += "&".join(params) + "&"
		query += "$limit=" + str(limit)
		return read_function(api_endpoint + urllib.parse.quote(query, safe="&?$=,!()"))

	def get_url_response(url):
		with urllib.request.urlopen(url) as response:
			if response.status == 200:
				return response.read()
			else:
				return None

	def get_metadata(api_info):
		def get_original_metadata(domain, dataset, actual_datasource_uri = None):
			original_metadata = json.loads(makeAPIRequest(
				api_endpoint = domain + "/api/views/metadata/v1/" + dataset + ".json",
				params = [],
				limit = limit,
				read_function = get_url_response
			))
			# if this isn't the full metadata for this dataset, use the provided "reviewableUid" as the metadata
			# while providing information about the actual original datasource
			if "approvals" in original_metadata and "reviewableUid" in original_metadata["approvals"][-1]:
				print(f"reviewableUid found for {original_metadata['name']}")
				return get_original_metadata(
					domain,
					original_metadata["approvals"][-1]["reviewableUid"],
					original_metadata["actualDatasourceUri"] if "actualDatasourceUri" in original_metadata else original_metadata["dataUri"],
				)
			else:
				# we've found the correct metadata to use, so include actual_datasource_uri in the metadata
				if actual_datasource_uri != None:
					original_metadata["actualDatasourceUri"] = actual_datasource_uri
				return original_metadata
		# get metadata
		original_metadata = get_original_metadata(api_info["domain"], api_info["dataset"])
		# edit metadata for return
		edited_metadata = { key: original_metadata[key] if key in original_metadata else None for key in [
			"name", "description", "dataUri", "attribution", "attributionLink", "actualDatasourceUri",
		] }
		for key in ["createdAt", "dataUpdatedAt", "metadataUpdatedAt"]:
			if (key not in original_metadata or original_metadata[key] == None):
				edited_metadata[key] = None
			else:
				edited_metadata[key] = from_iso_format(original_metadata[key])
		edited_metadata["accessedOn"] = fetchtime
		return edited_metadata

	def standardize_columns(df):
		"""standardize the names of all columns in df by making them lowercase and snake_case"""
		df.columns = df.columns.str.lower().str.split().str.join('_')
		
	def get_dataset_url(api_info, suffix):
		return api_info["domain"] + "/resource/" + api_info["dataset"] + "." + suffix

	def get_geojson_data(api_info, datafile=None, custom_metadata={}):
		output = {}
		if datafile == None:
			# get data from api
			output["data"] = json.loads(makeAPIRequest(
				api_endpoint = get_dataset_url(api_info, "geojson"),
				params = [],
				limit = limit,
				read_function = get_url_response
			))
		else:
			# get data from file
			with open(datafile, "r") as f:
				output["data"] = json.load(f)
		metadata = get_metadata(api_info)
		for k, v in custom_metadata.items():
			metadata[k] = v
		output["metadata"] = metadata
		return output

	def from_iso_format(date, formatString="%d %b %Y"):
		if pd.isna(date):
			return None
		else:
			return datetime.datetime.strptime(date.split('T')[0], "%Y-%m-%d").strftime(formatString)

	"""Aggregate x by returning a list of all unique, non-null values in x in the order they were encountered
	(or, if there is only one unique value in x, returning that value)"""
	def set_aggregation_function(x):
		xSet = OrderedDict()
		for item in x:
			if not pd.isna(item):
				xSet[item] = None
		xList = list(xSet.keys())
		xListLen = len(xList)
		if xListLen == 0:
			return None
		elif xListLen == 1:
			return xList[0]
		else:
			return xList

	# fetch data from the Property Locations dataset about all properties in Wards 1-50
	print("fetching properties data")
	properties = makeAPIRequest(
		api_endpoint = get_dataset_url(properties_api_info, "json"),
		params = [
			"$select=pin, property_address, property_zip, ward, longitude, latitude",
			"$where=(latitude IS NOT NULL) AND (longitude IS NOT NULL)",
		],
		limit = limit,
		read_function = pd.read_json,
	)
	properties_metadata = get_metadata(properties_api_info)
	properties_metadata["dataUseNotes"] = "Used to obtain location information for PINs in Cook County."

	properties["pin"] = properties["pin"].apply(str).str.rjust(14, '0')

	with open("../data/misc/misc.js", "w", encoding="utf-8") as f:
		f.write("const property_locations_metadata = ")
		f.write(json.dumps(properties_metadata) + ";")

	def get_school_locations():
		print("Getting data for school locations")
		with open("../data/geojson/school_locations.js", "w", encoding="utf-8") as f:
			f.write("const school_locations = ")
			f.write(json.dumps(get_geojson_data(school_locations_api_info)) + ";")
		print("Finished getting data for school_locations")

	def get_individual_properties():
		print("Getting data for individual properties")
		# fetch location info for Sunshine Gospel Ministries address (source: https://www.sunshinegospel.org/)
		sgmAddress = "500 E 61st St".lower()
		# get location data for Sunshine Gospel Ministries
		sgm = makeAPIRequest(
			api_endpoint = get_dataset_url(properties_api_info, "json"),
			params = [
				"$select=pin, property_address, longitude, latitude",
				f"$where=lower(property_address)='{sgmAddress}'",
			],
			limit = 1,
			read_function = pd.read_json,
		).loc[0]
		
		ward_20_office = makeAPIRequest(
			api_endpoint = get_dataset_url(ward_offices_api_info, "json"),
			params = [
				"$select=ward, address, location",
				"$where=ward=20",
			],
			limit = 1,
			read_function = pd.read_json,
		).loc[0]
		ward_20_office["latitude"] = ward_20_office["location"].get("latitude")
		ward_20_office["longitude"] = ward_20_office["location"].get("longitude")
		ward_20_office = ward_20_office.drop(labels=["location"])
		
		ward_offices_metadata = get_metadata(ward_offices_api_info)
		ward_offices_metadata["dataUseNotes"] = "Used to obtain location information for the Ward 20 office."
			
		with open("../data/misc/individual_properties.js", "w", encoding="utf-8") as f:
			f.write("const sunshine_gospel = ")
			f.write(sgm.to_json(orient="index") + ";")
			f.write("\n\nconst ward_20_office = ")
			f.write(ward_20_office.to_json(orient="index") + ";")
			f.write("\n\nconst ward_offices_metadata = ")
			f.write(json.dumps(ward_offices_metadata) + ";")
		print("Finished getting data for individual properties")

	def get_city_owned():
		print("Getting data for city-owned properties")
		# fetch data from the City-Owned Land Inventory dataset about all properties currently owned by the City of Chicago that might be up for sale (see http://dev.cityofchicago.org/open%20data/data%20portal/2020/08/11/city-owned-property.html)
		city_owned = makeAPIRequest(
			api_endpoint = get_dataset_url(city_owned_api_info, "json"),
			params = [
				"$select=pin, managing_organization, date_of_acquisition, last_update",
				"$where=(lower(property_status)='owned by city') AND (lower(managing_organization)='none' OR managing_organization IS NULL)",
			],
			limit = limit,
			read_function = pd.read_json,
		)
		city_owned_metadata = get_metadata(city_owned_api_info)
		
		def standardize_date(date):
			if pd.isna(date):
				return date
			else:
				return datetime.datetime.strftime(datetime.datetime.strptime(date, "%m/%d/%Y"), "%d %b %Y")
			
		city_owned["pin"] = city_owned["pin"].str.replace("-","")
		city_owned["date_of_acquisition"] = city_owned["date_of_acquisition"].apply(from_iso_format)
		city_owned["last_update"] = city_owned["last_update"].apply(standardize_date)

		city_owned_join = pd.merge(city_owned, properties, how="inner", on="pin", suffixes = ["_aksk-kvfp", "_c49d-89sn"])
		count_of_no_updated_location_info = city_owned.shape[0] - city_owned_join.shape[0]
		print("number of city-owned properties for which no location data from properties could be found:", count_of_no_updated_location_info)

		city_owned_metadata["dataUseNotes"] = 'Only PINs where "Property Status" is "owned by city" and' \
		+ ' "Managing Organization" is "none" or blank (using case-insensitive matching) have been included on the map' \
		+ ' (based on the Open Data Portal Team\'s' \
		+ ' <a href="http://dev.cityofchicago.org/open%20data/data%20portal/2020/08/11/city-owned-property.html">notes</a>' \
		+ ' about the dataset). Up-to-date location information was obtained using the' \
		+ f' <a href={properties_metadata["dataUri"]}>"{properties_metadata["name"]}"</a> dataset' \
		+ f' ({count_of_no_updated_location_info} PINs for which no up-to-date location information could be found have been excluded).'
		
		city_owned_join = city_owned_join.set_index("pin", drop=False)
		
		with open("../data/city-owned/city_owned_data.js", "w", encoding="utf-8") as f:
			f.write("const city_owned_data = ")
			f.write(city_owned_join.to_json(orient="index") + ";")
			f.write("\n\nconst city_owned_metadata = ")
			f.write(json.dumps(city_owned_metadata) + ";")
		print("Finished getting data for city-owned properties")

	def get_business_licenses():
		print("Getting data for business licenses")
		business_licenses = makeAPIRequest(
			api_endpoint = get_dataset_url(business_licenses_api_info, "json"),
			params = [
				"$select=license_number, license_id, doing_business_as_name, license_description, business_activity, address, zip_code, longitude, latitude, license_start_date",
				"$where=ward='20' AND (latitude IS NOT NULL) AND (longitude IS NOT NULL)",
			],
			limit = limit,
			read_function = pd.read_json,
		)
		business_licenses_metadata = get_metadata(business_licenses_api_info)
		business_licenses_metadata["dataUseNotes"] = 'Only information about the most recent licenses for businesses with valid coordinates in Ward 20 has been included on the map.'
		
		# filter out duplicate entries for the same license number, keeping only the entry with the most recent license start date
		business_licenses_filtered = business_licenses.sort_values(by=['license_number', 'license_start_date']).drop_duplicates(subset=['license_number'], keep='last').drop(columns=['license_number','license_start_date'])
		
		# aggregate licenses into a single entry for each address of each business
		business_licenses_aggregated = business_licenses_filtered.groupby(by=["doing_business_as_name", "address"]).agg(set_aggregation_function).reset_index()    
		with open("../data/business-licenses/business_license_data.js", "w", encoding="utf-8") as f:
			f.write("const business_license_data = ")
			f.write(business_licenses_aggregated.to_json(orient="records") + ";")
			f.write("\n\nconst business_licenses_metadata = ")
			f.write(json.dumps(business_licenses_metadata) + ";")
		print("Finished getting data for business licenses")

	def get_crimes():
		print("Getting data for crimes")
		# fetch data from the Property Locations dataset about all properties in Wards 1-50
		crimes = makeAPIRequest(
			api_endpoint = get_dataset_url(crimes_api_info, "json"),
			params = [
				"$select=case_ AS case_number, date_of_occurrence, block, _primary_decsription AS primary_description, _secondary_description AS secondary_description, _location_description AS location_description, longitude, latitude",
				"$where=(ward=20) AND (latitude IS NOT NULL) AND (longitude IS NOT NULL)",
			],
			limit = limit,
			read_function = pd.read_json,
		)
		crimes_metadata = get_metadata(crimes_api_info)
		crimes_metadata["dataUseNotes"] = "Only information about crimes in Ward 20 with valid coordinates has been included on the map."
		crimes["date_of_occurrence"] = crimes["date_of_occurrence"].apply(from_iso_format)
		with open("../data/crime/crime_data.js", "w", encoding="utf-8") as f:
			f.write("const crime_data = ")
			f.write(crimes.to_json(orient="records") + ";")
			f.write("\n\nconst crimes_metadata = ")
			f.write(json.dumps(crimes_metadata) + ";")
		print("Finished getting data for crimes")

	def get_data():
		get_school_locations()
		get_individual_properties()
		get_city_owned()
		get_business_licenses()
		get_crimes()
	
	get_data()

main()

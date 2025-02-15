import folium.plugins
import requests
import os
import json
import pandas as pd
from geopy.distance import geodesic
from pyproj import Transformer
import folium
from sklearn.cluster import DBSCAN
import numpy as np

CACHE_DIR = "cache"  # Folder for caching API responses

transformer = Transformer.from_crs("EPSG:25831", "EPSG:4326", always_xy=True)

def get_cache_filename(road_ref):
	return os.path.join(CACHE_DIR, f"{road_ref.replace('/', '_')}.json")

def load_cached_data(road_ref):
	cache_file = get_cache_filename(road_ref)
	if os.path.exists(cache_file):
		with open(cache_file, "r", encoding="utf-8") as f:
			return json.load(f)
	return None

def save_cache_data(road_ref, data):
	if not os.path.exists(CACHE_DIR):
		os.makedirs(CACHE_DIR)  
	cache_file = get_cache_filename(road_ref)
	with open(cache_file, "w", encoding="utf-8") as f:
		json.dump(data, f, indent=2)
	print(f"Cached data for {road_ref}.")

def query_overpass_api(road_ref):
	cached_data = load_cached_data(road_ref)
	if cached_data:
		return extract_nodes(cached_data)

	query = f"""
	[out:json];
	way["ref"="{road_ref}"]["highway"](40, 0, 42, 2);
	(._;>;);
	out body;
	"""
	url = "http://overpass-api.de/api/interpreter"
	print(f"Querying Overpass API for road {road_ref}...")
	response = requests.get(url, params={'data': query})

	if response.status_code != 200:
		print(f"Error: API request failed with status {response.status_code}")
		return None
	
	data = response.json()
	save_cache_data(road_ref, data)
	return extract_nodes(data)

def extract_nodes(data):
	"""
	Extracts nodes from the API response. If 'distance' tags exist, use them.
	Otherwise, compute distances manually.
	"""
	nodes = []
	has_distance_tag = False
	
	for element in data.get("elements", []):
		if element.get("type") == "node":
			node_info = {
				"lat": element["lat"],
				"lon": element["lon"],
				"distance": 0
			}
			if "tags" in element and "distance" in element["tags"]:
				try:
					node_info["distance"] = float(element["tags"]["distance"])
					has_distance_tag = True
				except ValueError:
					continue
			nodes.append(node_info)

	if not nodes:
		print("No nodes found in API response.")
		return None

	if has_distance_tag:
		return nodes
	
	return compute_cumulative_distances(nodes)

def compute_cumulative_distances(nodes):
	"""
	Computes cumulative distances along the road if 'distance' tags are missing.
	"""
	cumulative_distance = 0.0
	
	for i in range(1 , len(nodes)-1):
		# Calculate geodesic distance between consecutive nodes
		segment_distance = geodesic(
			(nodes[i-1]["lat"], nodes[i-1]["lon"]),
			(nodes[i]["lat"], nodes[i]["lon"])
		).kilometers
		
		cumulative_distance += segment_distance
		nodes[i]["distance"] = cumulative_distance
	
	return nodes

def find_closest_node(nodes, target_kp):
	"""
	Finds the node with the closest distance value to the given KP.
	If the KP falls between two nodes, performs linear interpolation.
	"""
	best_node = None
	best_diff = float("inf")

	for i in range(len(nodes) - 1):
		dist1, dist2 = nodes[i]["distance"], nodes[i+1]["distance"]
		
		if dist1 <= target_kp <= dist2:
			
			fraction = (target_kp - dist1) / (dist2 - dist1) if dist2 > dist1 else 0
			lat = nodes[i]["lat"] + fraction * (nodes[i+1]["lat"] - nodes[i]["lat"])
			lon = nodes[i]["lon"] + fraction * (nodes[i+1]["lon"] - nodes[i]["lon"])
			return {"lat": lat, "lon": lon, "distance": target_kp}

		diff = abs(target_kp - dist1)
		if diff < best_diff:
			best_diff = diff
			best_node = nodes[i]
	
	return best_node

def detect_accident_zones_dbscan(accident_coords, radius_km=1, min_accidents=5):
	"""
	Uses DBSCAN to group nearby accidents and detect accident-prone zones.

	Parameters:
		accident_coords (list): List of accident locations as [[lat, lon], ...]
		radius_km (float): The clustering radius in kilometers.
		min_accidents (int): Minimum number of accidents to form a high-risk cluster.

	Returns:
		list: List of cluster centers (each as [lat, lon]) for clusters that meet the threshold.
	"""
	if not accident_coords:
		return []
	
	# Convert to a NumPy array
	coords_array = np.array(accident_coords)
	
	# Convert coordinates to radians (required by haversine metric)
	coords_rad = np.radians(coords_array)
	
	# Calculate eps in radians: radius_km divided by Earth's radius (6371 km)
	eps = radius_km / 6371.0  # For a 1 km radius, eps ≈ 0.000157
	
	db = DBSCAN(eps=eps, min_samples=min_accidents, metric='haversine').fit(coords_rad)
	labels = db.labels_
	
	unique_labels = set(labels)
	accident_zones = []
	
	# Compute cluster centers (skip noise points labeled as -1)
	for label in unique_labels:
		if label == -1:
			continue
		cluster_points = coords_array[labels == label]
		center = np.mean(cluster_points, axis=0)
		accident_zones.append([center.tolist(), len(cluster_points)])
	
	return accident_zones

def createAccidentCoords():
	accidentRoads = {}
	accidentCoords = []
	accidents = pd.read_json('https://analisi.transparenciacatalunya.cat/resource/rmgc-ncpb.json?$query=SELECT%20%60dat%60%2C%20%60via%60%2C%20%60pk%60%2C%20%60nomdem%60%2C%20%60hor%60%0AWHERE%0A%20%20caseless_contains(%60nomdem%60%2C%20%22Tarragona%22)%0A%20%20AND%20caseless_ne(%60pk%60%2C%20%22999999%22)')

	for index, row in accidents.loc[:, ['via', 'pk']].iterrows():
		if row["via"] not in accidentRoads:
			accidentRoads[row["via"]] = []
		accidentRoads[row["via"]].append(float(row['pk'].replace(",", ".")))

	for road in accidentRoads:
		road_ref = road
		kp_values = accidentRoads[road]
	
		nodes = query_overpass_api(road_ref)
		if not nodes:
			print("No valid data retrieved. Skipping.")
			continue
	
		for kp in kp_values:
			closest_node = find_closest_node(nodes, kp)
			
			if closest_node:
				accidentCoords.append([closest_node['lat'], closest_node['lon']])
			else:
				print(f"No suitable node found for KP {kp} km.")
	return accidentCoords

def createRadarCoords():
	radarCoords = []
	radars = pd.read_csv('radares.csv')
	for index, row in radars.iterrows():
		lon, lat = transformer.transform(row['X'], row['Y'])
		if lat > 40.0 and lat < 42.0 and lon > 0.0 and lon < 2.0:
			radarCoords.append([lat, lon])
	return radarCoords

def createZoneCoords():
	zoneCoords = []
	
	zoneCoords = detect_accident_zones_dbscan(createAccidentCoords(), radius_km=0.75, min_accidents=5)
 
	return zoneCoords

def main():
	
	tgnMap = folium.Map(location=[41.0, 1.0], tiles="OpenStreetMap", zoom_start=5)
 
	for item in createAccidentCoords():
		folium.Marker(item, icon=folium.Icon(color='red')).add_to(tgnMap)
	
	for item in createRadarCoords():
		folium.Marker(item, icon=folium.Icon(color='gray')).add_to(tgnMap)
	
	zones = createZoneCoords()
	for ind in range(0, len(zones)-1):
		folium.Marker(zones[ind][0], icon=folium.Icon(color='blue'), popup=str(zones[ind][1])).add_to(tgnMap)
  
	tgnMap.save("map.html")

if __name__ == "__main__":
	main()

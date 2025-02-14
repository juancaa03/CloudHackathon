import requests
import os
import json
import pandas as pd

CACHE_DIR = "cache"  # Folder for caching API responses

def get_cache_filename(road_ref):
    """
    Generates a filename for caching based on the road reference.
    """
    return os.path.join(CACHE_DIR, f"{road_ref.replace('/', '_')}.json")

def load_cached_data(road_ref):
    """
    Checks if a cached JSON file exists and loads it.
    
    Parameters:
        road_ref (str): The road identifier (e.g., "N-420").
    
    Returns:
        dict: Loaded JSON data if cache exists, otherwise None.
    """
    cache_file = get_cache_filename(road_ref)
    if os.path.exists(cache_file):
        print(f"Using cached data for {road_ref}...")
        with open(cache_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

def save_cache_data(road_ref, data):
    """
    Saves API response data to a cache file.
    
    Parameters:
        road_ref (str): The road identifier.
        data (dict): JSON data from Overpass API.
    """
    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR)  # Create cache directory if it doesn't exist
    
    cache_file = get_cache_filename(road_ref)
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Cached data for {road_ref}.")

def query_overpass_api(road_ref):
    """
    Queries Overpass API for a specific road and caches the result.
    
    Parameters:
        road_ref (str): The road identifier.
    
    Returns:
        list: List of nodes containing 'lat', 'lon', and 'distance' in 'tags'.
    """
    # Check if we already have cached data
    cached_data = load_cached_data(road_ref)
    if cached_data:
        return extract_nodes(cached_data)

    # Overpass API query
    query = f"""
    [out:json];
    way["ref"="{road_ref}"]["highway"];
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
    
    # Cache the response
    save_cache_data(road_ref, data)

    return extract_nodes(data)

def extract_nodes(data):
    """
    Extracts node data with 'distance' tags from the API response.
    
    Parameters:
        data (dict): JSON response from Overpass API.
    
    Returns:
        list: List of nodes with 'lat', 'lon', and 'distance'.
    """
    nodes = []
    for element in data.get("elements", []):
        if element.get("type") == "node" and "tags" in element and "distance" in element["tags"]:
            try:
                node_distance = float(element["tags"]["distance"])
                nodes.append({
                    "lat": element["lat"],
                    "lon": element["lon"],
                    "distance": node_distance
                })
            except ValueError:
                continue  # Skip invalid values
    
    if not nodes:
        print("No nodes with 'distance' data found.")
        return None
    
    return nodes

def find_closest_node(nodes, target_kp):
    """
    Finds the node with the closest distance value to the given KP.
    
    Parameters:
        nodes (list): List of node dictionaries with 'lat', 'lon', and 'distance'.
        target_kp (float): The target KP value in kilometers.
    
    Returns:
        dict: The closest node.
    """
    best_node = None
    best_diff = float("inf")
    
    for node in nodes:
        diff = abs(node["distance"] - target_kp)
        if diff < best_diff:
            best_diff = diff
            best_node = node
    
    return best_node

def main():
    
    roads = {}
    accidents = pd.read_json('https://analisi.transparenciacatalunya.cat/resource/rmgc-ncpb.json?$query=SELECT%20%60dat%60%2C%20%60via%60%2C%20%60pk%60%2C%20%60nomdem%60%2C%20%60hor%60%0AWHERE%0A%20%20caseless_contains(%60nomdem%60%2C%20%22Tarragona%22)%0A%20%20AND%20caseless_ne(%60pk%60%2C%20%22999999%22)')
    
    for index, row in accidents.loc[:, ['via', 'pk']].iterrows():
        if row["via"] not in roads:
            roads[row['via']] = []
        roads[row['via']].append(row['pk'])
    
    #show amount of accidents for each road    
    #for road in roads:
    #    print(f"Road: {road} - accidents: {len(roads[road])}")               
        
    # Define the road and the list of KP values to check
    for road in roads:
        road_ref = road
        kp_values = roads[road]
    
        # Fetch nodes (either from cache or API)
        nodes = query_overpass_api(road_ref)
    
        if not nodes:
            print("No valid data retrieved. Exiting.")
            return
    
        # Process each KP value
        for kp in kp_values:
            closest_node = find_closest_node(nodes, kp)
            
            if closest_node:
                print(f"Closest match for KP {kp} km on {road_ref}:")
                print(f"  Latitude:  {closest_node['lat']}")
                print(f"  Longitude: {closest_node['lon']}")
                print(f"  Node distance: {closest_node['distance']} km\n")
            else:
                print(f"No suitable node found for KP {kp} km.")

if __name__ == "__main__":
    main()

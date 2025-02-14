import requests
import pandas as pd

def query_overpass_api(road_ref):
    """
    Queries the Overpass API for a specific road reference and retrieves all relevant nodes.
    
    Parameters:
        road_ref (str): The road identifier (e.g., "N-420").
    
    Returns:
        list: A list of nodes containing 'lat', 'lon', and 'distance' in 'tags'.
    """
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
                continue  # Skip nodes with invalid distance values
    
    if not nodes:
        print(f"No nodes with 'distance' data found for road {road_ref}.")
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

#https://analisi.transparenciacatalunya.cat/resource/rmgc-ncpb.json?$query=SELECT%20%60dat%60%2C%20%60via%60%2C%20%60pk%60%2C%20%60nomdem%60%2C%20%60hor%60%0AWHERE%0A%20%20caseless_contains(%60nomdem%60%2C%20%22Tarragona%22)%0A%20%20AND%20caseless_ne(%60pk%60%2C%20%22999999%22)
def main():
    # Define the road and the list of KP values to check
    road_ref = "N-420"
    kp_values = [867.0, 870.5, 873.2]  # Example KP values
    
    # Fetch nodes from the Overpass API
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

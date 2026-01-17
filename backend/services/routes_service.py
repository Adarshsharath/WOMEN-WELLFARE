import os
import requests
import pandas as pd
import numpy as np
from scipy.spatial import KDTree
from math import radians, sin, cos, sqrt, atan2
from dotenv import load_dotenv

load_dotenv()

OSRM_SERVER = os.getenv('OSRM_SERVER', 'http://router.project-osrm.org')

# Load CSV data
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

try:
    crime_df = pd.read_csv(os.path.join(DATA_DIR, 'bangalore_crimes.csv'))
    lighting_df = pd.read_csv(os.path.join(DATA_DIR, 'bangalore_lighting.csv'))
    population_df = pd.read_csv(os.path.join(DATA_DIR, 'bangalore_population.csv'))
    
    # Initialize KDTrees for fast spatial querying - Use capitalized Latitude/Longitude
    crime_tree = KDTree(crime_df[['Latitude', 'Longitude']].values) if not crime_df.empty else None
    lighting_tree = KDTree(lighting_df[['Latitude', 'Longitude']].values) if not lighting_df.empty else None
    population_tree = KDTree(population_df[['Latitude', 'Longitude']].values) if not population_df.empty else None
    
    print(f"CSV data loaded and indexed - Crime: {len(crime_df)} rows, Lighting: {len(lighting_df)} rows, Population: {len(population_df)} rows")
except Exception as e:
    print(f"Error loading CSV data: {e}")
    crime_df = pd.DataFrame(columns=['Latitude', 'Longitude', 'Crime type'])
    lighting_df = pd.DataFrame(columns=['Latitude', 'Longitude', 'lighting_score'])
    population_df = pd.DataFrame(columns=['Latitude', 'Longitude', 'population_density'])
    crime_tree = lighting_tree = population_tree = None


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers"""
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return distance


def create_fallback_routes(start_lat, start_lon, end_lat, end_lon):
    """Create synthetic routes when OSRM is unavailable"""
    print("Using fallback route generation...")
    
    # Calculate straight-line distance
    distance = haversine_distance(start_lat, start_lon, end_lat, end_lon) * 1000  # in meters
    
    # Create 5 different route variations
    routes = []
    
    for i in range(5):
        # Create interpolated points
        num_points = 20
        lats = np.linspace(start_lat, end_lat, num_points)
        lons = np.linspace(start_lon, end_lon, num_points)
        
        # Add some variation for different routes
        if i > 0:
            variation = np.random.uniform(-0.01, 0.01, num_points)
            lats += variation
            lons += variation
        
        coordinates = [[lon, lat] for lat, lon in zip(lats, lons)]
        
        # Estimate duration (assume 40 km/h average speed)
        duration = (distance / 1000) / 40 * 3600  # in seconds
        
        # Add variation to distance and duration
        distance_multiplier = 1 + (i * 0.1)  # Each route slightly longer
        
        routes.append({
            'geometry': {
                'coordinates': coordinates,
                'type': 'LineString'
            },
            'distance': distance * distance_multiplier,
            'duration': duration * distance_multiplier
        })
    
    return routes


def generate_strategic_waypoints(start_lat, start_lon, end_lat, end_lon):
    """Generate potential waypoints using perpendicular offsets at 25%, 50%, 75% of path"""
    waypoints = []
    
    # Vector from start to end
    dx = end_lon - start_lon
    dy = end_lat - start_lat
    
    # Distance
    dist = sqrt(dx**2 + dy**2)
    if dist == 0:
        return []
    
    # Unit perpendicular vector
    ux = -dy / dist
    uy = dx / dist
    
    # Offsets in km converted to approx degrees (1km ~ 0.009 degrees)
    offsets_km = [0.5, 1.2, 2.5]
    percentages = [0.25, 0.5, 0.75]
    
    for p in percentages:
        # Midpoint at p%
        mid_lat = start_lat + p * dy
        mid_lon = start_lon + p * dx
        
        for offset in offsets_km:
            offset_deg = offset * 0.009
            
            # Left offset
            waypoints.append({
                'lat': mid_lat + offset_deg * uy,
                'lon': mid_lon + offset_deg * ux
            })
            
            # Right offset
            waypoints.append({
                'lat': mid_lat - offset_deg * uy,
                'lon': mid_lon - offset_deg * ux
            })
            
    return waypoints


def get_routes_from_osrm(start_lat, start_lon, end_lat, end_lon, waypoints=None, num_alternatives=7):
    """Fetch multiple route alternatives from OSRM with optional waypoints"""
    try:
        if waypoints:
            # Format: start;waypoint;end
            coord_str = f"{start_lon},{start_lat}"
            for wp in waypoints:
                coord_str += f";{wp['lon']},{wp['lat']}"
            coord_str += f";{end_lon},{end_lat}"
            
            url = f"{OSRM_SERVER}/route/v1/driving/{coord_str}?steps=true&overview=full&geometries=geojson"
        else:
            url = f"{OSRM_SERVER}/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}?alternatives={num_alternatives}&steps=true&overview=full&geometries=geojson"
        
        print(f"Requesting OSRM routes: {url}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('code') == 'Ok' and 'routes' in data:
                return data['routes']
        
        print(f"OSRM API error: {response.text}")
    
    except Exception as e:
        print(f"Error fetching routes from OSRM: {str(e)}")
    
    return []


def calculate_crime_exposure(lat, lon, radius=0.003):
    """Count crimes within a radius (default ~300m)"""
    if crime_tree is None:
        return 0
    
    indices = crime_tree.query_ball_point([lat, lon], radius)
    return len(indices)


def calculate_lighting_score_at_point(lat, lon, radius=0.005):
    """Average lighting score within a radius (default ~500m)"""
    if lighting_tree is None:
        return 5.0  # Neutral fallback
    
    indices = lighting_tree.query_ball_point([lat, lon], radius)
    if not indices:
        return 5.0
    
    return lighting_df.iloc[indices]['lighting_score'].mean()


def calculate_population_score_at_point(lat, lon, radius=0.005):
    """Get population density and traffic within a radius (default ~500m)"""
    if population_tree is None:
        return 15000, False  # Count, is_main_road
    
    indices = population_tree.query_ball_point([lat, lon], radius)
    if not indices:
        return 15000, False
    
    relevant_data = population_df.iloc[indices]
    
    # Try different column names for population
    pop_col = 'population_density' if 'population_density' in population_df.columns else 'population_count'
    avg_pop = relevant_data[pop_col].mean() if pop_col in relevant_data.columns else 15000
    
    is_main_road = any(relevant_data.get('is_main_road', [False] * len(relevant_data)))
    
    return avg_pop, is_main_road


def calculate_crime_score(route_coordinates):
    """Calculate average crime exposure for a route"""
    if crime_df.empty:
        return np.random.uniform(0.3, 0.7)
    
    total_crimes = 0
    sample_size = min(20, len(route_coordinates))
    sample_indices = np.linspace(0, len(route_coordinates)-1, sample_size, dtype=int)
    
    for idx in sample_indices:
        lon, lat = route_coordinates[idx]
        total_crimes += calculate_crime_exposure(lat, lon)
    
    # Normalize crime score (0 to 1 scale for the service)
    # Assume 10+ crimes in radius is "very dangerous" (1.0)
    avg_crimes = total_crimes / sample_size if sample_size > 0 else 0
    return min(avg_crimes / 10.0, 1.0)


def calculate_lighting_score(route_coordinates):
    """Calculate average lighting score for a route"""
    if lighting_df.empty:
        return np.random.uniform(0.3, 0.7)
    
    total_score = 0
    sample_size = min(20, len(route_coordinates))
    sample_indices = np.linspace(0, len(route_coordinates)-1, sample_size, dtype=int)
    
    for idx in sample_indices:
        lon, lat = route_coordinates[idx]
        total_score += calculate_lighting_score_at_point(lat, lon)
    
    # Normalize score (originally 1-10, map to 0-1)
    avg_score = total_score / sample_size if sample_size > 0 else 5.0
    return avg_score / 10.0


def calculate_population_score(route_coordinates):
    """Calculate average population density for a route"""
    if population_df.empty:
        return 15000
    
    total_population = 0
    sample_size = min(20, len(route_coordinates))
    sample_indices = np.linspace(0, len(route_coordinates)-1, sample_size, dtype=int)
    
    for idx in sample_indices:
        lon, lat = route_coordinates[idx]
        pop_count, _ = calculate_population_score_at_point(lat, lon)
        total_population += pop_count
    
    return total_population / sample_size if sample_size > 0 else 15000


def check_flagged_zones(route_coordinates, flagged_zones):
    """Check if route passes through flagged high-risk zones"""
    risk_penalty = 0
    
    sample_size = min(20, len(route_coordinates))
    sample_indices = np.linspace(0, len(route_coordinates)-1, sample_size, dtype=int)
    
    for idx in sample_indices:
        lon, lat = route_coordinates[idx]
        
        for zone in flagged_zones:
            distance = haversine_distance(lat, lon, zone['latitude'], zone['longitude'])
            
            # If route passes within 200m of a flagged zone
            if distance < 0.2:
                penalty_map = {'CRITICAL': 0.4, 'HIGH': 0.3, 'MEDIUM': 0.2, 'LOW': 0.1}
                risk_penalty += penalty_map.get(zone['risk_level'], 0.1)
    
    return min(risk_penalty, 1.0)  # Cap at 1.0


def calculate_route_safety_comprehensive(route, flagged_zones=[]):
    """Evaluate route safety with point sampling, hotspot penalties, and max exposure"""
    coordinates = route['geometry']['coordinates']
    
    # Sampling: every ~50 segments/points
    stride = max(1, len(coordinates) // 20)
    sample_points = coordinates[::stride]
    
    point_scores = []
    hotspots_count = 0
    max_exposure = 0
    
    for lon, lat in sample_points:
        crime_count = calculate_crime_exposure(lat, lon)
        lighting = calculate_lighting_score_at_point(lat, lon)
        pop, _ = calculate_population_score_at_point(lat, lon)
        
        # Point safety calculation
        # Crime is primary threat (0 to 1, where 1 is dangerous)
        point_crime_risk = min(crime_count / 5.0, 1.0) 
        if crime_count > 3:
            hotspots_count += 1
            
        max_exposure = max(max_exposure, point_crime_risk)
        
        # Point score (higher is safer)
        # 10 is perfect, 0 is dangerous
        p_score = (1 - point_crime_risk) * 6 + (lighting / 2.0) + (min(pop / 15000, 1.0) * 1.0)
        point_scores.append(p_score)
        
    avg_safety = sum(point_scores) / len(point_scores) if point_scores else 5.0
    
    # Apply penalties
    hotspot_ratio = hotspots_count / len(point_scores) if point_scores else 0
    penalty = (hotspot_ratio * 2.0) + (max_exposure * 1.5)
    
    final_safety_score = max(0, min(100, (avg_safety * 10) - (penalty * 10)))
    
    return {
        'safety_score': round(final_safety_score, 1),
        'hotspots': hotspots_count,
        'max_exposure': round(max_exposure, 2),
        'avg_lighting': round(sum([calculate_lighting_score_at_point(lat, lon) for lon, lat in sample_points]) / len(sample_points), 1) if sample_points else 5.0
    }


def calculate_safe_routes(start_lat, start_lon, end_lat, end_lon, flagged_zones=[], safety_priority=70, **kwargs):
    """Calculate and return 7 different route types using Phase 1 & 2 strategy"""
    try:
        print(f"Calculating advanced routes from ({start_lat}, {start_lon}) to ({end_lat}, {end_lon})")
        
        # Phase 1: Direct Alternatives
        direct_routes = get_routes_from_osrm(start_lat, start_lon, end_lat, end_lon, num_alternatives=3)
        if not direct_routes:
            direct_routes = create_fallback_routes(start_lat, start_lon, end_lat, end_lon)
            
        shortest_distance = min([r['distance'] for r in direct_routes])
        
        # Phase 2: Strategic Waypoint Exploration
        all_candidate_routes = []
        for r in direct_routes:
            all_candidate_routes.append({'route': r, 'source': 'direct'})
            
        waypoints = generate_strategic_waypoints(start_lat, start_lon, end_lat, end_lon)
        print(f"Generated {len(waypoints)} strategic waypoints for exploration")
        
        for wp in waypoints:
            routes = get_routes_from_osrm(start_lat, start_lon, end_lat, end_lon, waypoints=[wp])
            for r in routes:
                # Filter: Detour ratio <= 1.8
                if r['distance'] <= shortest_distance * 1.8:
                    all_candidate_routes.append({'route': r, 'source': 'strategic'})
        
        # Evaluate all candidates
        scored_routes = []
        for item in all_candidate_routes:
            route = item['route']
            safety_metrics = calculate_route_safety_comprehensive(route, flagged_zones)
            
            # Composite Score: 70% Safety, 30% Distance
            # Distance is normalized against shortest (1.0 = shortest, 0.0 = 1.8x shortest)
            distance_penalty = (route['distance'] / shortest_distance - 1) / 0.8 # 0 to 1
            composite_score = (safety_metrics['safety_score'] * 0.7) + ((1 - distance_penalty) * 30)
            
            # Main road detection (simplified: if >50% of sampled points on main road)
            main_road_count = 0
            stride = max(1, len(route['geometry']['coordinates']) // 20)
            for lon, lat in route['geometry']['coordinates'][::stride]:
                _, is_main = calculate_population_score_at_point(lat, lon)
                if is_main: main_road_count += 1
            
            scored_routes.append({
                'route': route,
                'metrics': safety_metrics,
                'composite_score': composite_score,
                'distance': route['distance'],
                'duration': route['duration'],
                'on_main_road': main_road_count > (len(route['geometry']['coordinates'][::stride]) / 2)
            })
            
        # Select and Category Mapping
        # ⭐ Best: Highest overall composite score
        best_route = max(scored_routes, key=lambda x: x['composite_score'])
        
        # 🛡️ Safest: Extremely low crime density and zero hotspots
        safest_route = max(scored_routes, key=lambda x: x['metrics']['safety_score'])
        
        # ⚡ Fastest: Minimal distance
        fastest_route = min(scored_routes, key=lambda x: x['distance'])
        
        # 🛣️ Main Roads: High percentage of travel on major roads
        main_roads_route = next((r for r in sorted(scored_routes, key=lambda x: x['composite_score'], reverse=True) if r['on_main_road']), best_route)
        
        # ⚖️ Balanced: Moderate distance and high safety
        balanced_route = sorted(scored_routes, key=lambda x: x['composite_score'], reverse=True)[min(len(scored_routes)-1, 2)]
        
        # 🌙 Well-lit: Highest lighting score
        well_lit_route = max(scored_routes, key=lambda x: x['metrics']['avg_lighting'])

        # 🏙️ High Population: Highest population density
        pop_routes = []
        for r in scored_routes:
            pop = calculate_population_score(r['route']['geometry']['coordinates'])
            pop_routes.append((r, pop))
        high_pop_route = max(pop_routes, key=lambda x: x[1])[0]

        def format_route(r, category, label):
            crime_incidents = int(r['metrics'].get('hotspots', 0) * 2 + (r['metrics'].get('max_exposure', 0) * 5))
            
            # Extract navigation steps
            steps = []
            if 'legs' in r['route']:
                for leg in r['route']['legs']:
                    if 'steps' in leg:
                        for step in leg['steps']:
                            steps.append({
                                'instruction': step.get('maneuver', {}).get('instruction', 'Continue'),
                                'distance': step.get('distance', 0),
                                'duration': step.get('duration', 0),
                                'location': step.get('maneuver', {}).get('location', [])
                            })

            return {
                'geometry': r['route']['geometry'],
                'distance': float(r['distance']),
                'duration': float(r['duration']),
                'safety_score': float(r['metrics']['safety_score']),
                'crime_incidents': crime_incidents,
                'lighting_score': float(r['metrics'].get('avg_lighting', 5.0) * 10),
                'population_score': 15000, # Legacy field
                'crime_score': (100 - float(r['metrics']['safety_score'])) / 100, # Legacy field
                'type': category,
                'label': label,
                'steps': steps,
                'reasons': [f"{label} option", "Low crime density" if r['metrics']['safety_score'] > 80 else "Optimized path"],
                'warnings': ["Moderate crime exposure" if r['metrics']['max_exposure'] > 0.5 else "None"],
                'badge': f"{label.upper()} ({r['metrics']['safety_score']}/100)"
            }

        result = {
            'success': True,
            'routes': [
                format_route(best_route, 'best', '⭐ Best'),
                format_route(safest_route, 'safest', '🛡️ Safest'),
                format_route(fastest_route, 'fastest', '⚡ Fastest'),
                format_route(main_roads_route, 'main_roads', '🛣️ Main Roads'),
                format_route(balanced_route, 'balanced', '⚖️ Balanced'),
                format_route(well_lit_route, 'well_lit', '🌙 Well-lit'),
                format_route(high_pop_route, 'high_pop', '🏙️ High Population')
            ],
            # Restore compatibility keys for frontend
            'best_match': format_route(best_route, 'best_match', 'Route 1'),
            'safest': format_route(safest_route, 'safest', 'Route 2'),
            'shortest': format_route(fastest_route, 'shortest', 'Route 3'),
            'most_populated': format_route(high_pop_route, 'populated', 'Route 4'),
            'low_crime': format_route(safest_route, 'low_crime', 'Route 5')
        }
        
        print(f"Successfully calculated 7 categorical routes from {len(scored_routes)} candidates")
        return result
    
    except Exception as e:
        print(f"Error calculating safe routes: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': f'Error calculating routes: {str(e)}'
        }

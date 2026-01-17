import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.routes_service import generate_strategic_waypoints, calculate_route_safety_comprehensive, calculate_safe_routes

def test_waypoint_generation():
    print("\n--- Testing Waypoint Generation ---")
    start_lat, start_lon = 12.9716, 77.5946  # Bangalore Central
    end_lat, end_lon = 12.9352, 77.6245    # Koramangala
    
    waypoints = generate_strategic_waypoints(start_lat, start_lon, end_lat, end_lon)
    print(f"Generated {len(waypoints)} waypoints")
    for i, wp in enumerate(waypoints[:5]):
        print(f"WP {i}: {wp}")
    
    assert len(waypoints) == 18 # 3 positions * 3 offsets * 2 sides
    print("✅ Waypoint generation successful")

def test_mock_route_evaluation():
    print("\n--- Testing Route Evaluation ---")
    # Mock route (straight line with 100 points)
    lats = [12.9716 + i * 0.0001 for i in range(100)]
    lons = [77.5946 + i * 0.0001 for i in range(100)]
    mock_route = {
        'geometry': {
            'coordinates': [[lon, lat] for lat, lon in zip(lats, lons)],
            'type': 'LineString'
        }
    }
    
    metrics = calculate_route_safety_comprehensive(mock_route)
    print(f"Metrics: {metrics}")
    assert 'safety_score' in metrics
    assert 'hotspots' in metrics
    print("✅ Route evaluation successful")

if __name__ == "__main__":
    try:
        test_waypoint_generation()
        test_mock_route_evaluation()
        print("\nAll tests passed locally!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

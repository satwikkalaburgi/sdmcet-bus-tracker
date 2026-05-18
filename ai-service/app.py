from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.cluster import DBSCAN
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/api/optimize-route', methods=['POST'])
def optimize_route():
    data = request.json
    if not data or 'locations' not in data:
        return jsonify({"error": "Missing locations data"}), 400
        
    locations = data['locations']
    if len(locations) < 10:
        return jsonify({"message": "Not enough data for optimization", "optimizedPath": []}), 200

    # Convert to DataFrame
    df = pd.DataFrame(locations)
    
    # Coordinates for clustering
    coords = df[['lat', 'lng']].values
    
    # DBSCAN to filter out noise and cluster frequent paths
    # eps is roughly 50 meters in degrees (~0.0005)
    db = DBSCAN(eps=0.0005, min_samples=5, metric='euclidean').fit(coords)
    df['cluster'] = db.labels_
    
    # Filter out noise (cluster == -1)
    core_path = df[df['cluster'] != -1]
    
    # Group by cluster and get the mean coordinate to form the path
    if core_path.empty:
        return jsonify({"message": "No stable route found", "optimizedPath": []}), 200
        
    optimized_path = core_path.groupby('cluster')[['lat', 'lng']].mean().reset_index()
    
    # Sort the path based on simple progression (e.g. index/time proxy if timestamps were used)
    # For simplicity, we just return the clustered centers as the path
    result = optimized_path[['lat', 'lng']].to_dict(orient='records')
    
    return jsonify({"message": "Route optimized", "optimizedPath": result}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

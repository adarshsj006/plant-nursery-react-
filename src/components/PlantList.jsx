import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchPlants } from "../redux/plantsSlice";

const PlantList = () => {
  const plants = useSelector((state) => state.plants.list);

  const [filteredPlants, setFilteredPlants] = useState([]);
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPlants());
  }, [dispatch]);

  useEffect(() => {
    let results = plants;

    if (search) {
      const q = search.toLowerCase();
      results = results.filter((plant) => {
        const name = (plant?.name || "").toLowerCase();
        const desc = (plant?.description || "").toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }

    setFilteredPlants(results);
  }, [search, plants]);

  return (
    <div className="plants-container">
      <div className="plants-header">
        <h1>Beautiful Plants for Your Space</h1>
        <p>Browse our collection of healthy, well-cared plants</p>

        {/* SEARCH */}
        <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
          <input
            type="text"
            placeholder="Search plants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 20px",
              border: "2px solid #4caf50",
              borderRadius: "25px",
              fontSize: "1rem",
              marginBottom: "1rem",
            }}
          />
        </div>
      </div>

      {/* PLANT GRID */}
      <div className="plants-grid">
        {filteredPlants.map((plant) => {
          const price = Number(plant?.price || 0);
          const image =
            plant?.image || "https://via.placeholder.com/300x200?text=Plant";
          const description = plant?.description || "";

          return (
            <div key={plant.id} className="plant-card">
              <img src={image} alt={plant.name} className="plant-image" />
              <div className="plant-info">
                <h3>{plant.name}</h3>
                <div className="plant-price">₹{price.toFixed(2)}</div>
                <p className="plant-description">{description}</p>

                <Link to={`/product/${plant.id}`}>
                  <button className="btn">View Details</button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlantList;
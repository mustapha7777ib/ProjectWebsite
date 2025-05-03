import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function MatchingArtisansPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const city = queryParams.get('city');
    const artisan = queryParams.get('artisan');

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtisans = async () => {
            try {
                const response = await fetch(`/api/artisans?artisan=${encodeURIComponent(artisan)}&city=${encodeURIComponent(city)}`);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setResults(data);
            } catch (err) {
                console.error('Failed to fetch artisans:', err);
                setError('Could not fetch matching artisans');
            } finally {
                setLoading(false);
            }
        };

        fetchArtisans();
    }, [artisan, city]);

    return (
        <div className="matching-artisans-page">
            <h1>Matching Artisans</h1>
            <p>Location: <strong>{city}</strong> | Service: <strong>{artisan}</strong></p>

            {loading && <p>Loading artisans...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="results-list">
                {results.length === 0 && !loading && <p>No artisans found for this search.</p>}

                {results.map((artisan, i) => (
                    <div key={i} className="artisan-card">
                        <h3>{artisan.name}</h3>
                        <p>Email: {artisan.email}</p>
                        <p>Phone: {artisan.phone}</p>
                        <p>Location: {artisan.city}</p>
                        <p>Service: {artisan.service_type}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MatchingArtisansPage;

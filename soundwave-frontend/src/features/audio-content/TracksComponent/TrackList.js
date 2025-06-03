import React, {useState, useEffect} from "react";
import axios from "axios";
import TrackCard from './TrackCard';
import './TrackList.css'

function TrackList({filter}) {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() =>{
        const fetchTracks = async () =>
        {
            try{
                setLoading(true);
                const token = localStorage.getItem('token');
                let url = 'http://localhost:8080/api/tracks';

                const headers = token ? {Authorization: `Bearer ${token}`} : {};

                const response = await axios.get(url, headers);
                setTracks(response);
                setLoading(false);
            }
            catch(err){
                console.error("Error fetching tracks:", err);
                setError('Failed to load tracks. Please try again.');
                setLoading(false);
            }
        };

        fetchTracks();
    }, [filter]);

    if(loading) return <div className="loading">Загрузка треков...</div>;
    if(error) return <div className="error">{error}</div>;
    if(tracks.length === 0) return <div className="no-tracks">Треки были не найдены</div>;

    return(
        <div className="track-list">
            {tracks.map(track => (
                <TrackCard key={track.id} track={track} />
            ))}
        </div>
    );
}

export default TrackList;
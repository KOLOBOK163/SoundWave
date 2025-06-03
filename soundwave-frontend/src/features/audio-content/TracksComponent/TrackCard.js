import React from "react";
import './TrackCard.css';

function TrackCard({track}){
    const handlePlay = () => {
        const event = new CustomEvent('playTrack', {detail: track});
        window.dispatchEvent(event);
    };

    return(
        <div className="track-card">
            <div className="track-card__cover" onClick={handlePlay}>
                <img
                    src={track.coverUrl ? `http://localhost:8080${track.coverUrl}`: 'https://via.placeholder.com/150'}
                    alt = {track.title}
                    className="track-card__image"
                />
                <div className="track-card__play-icon">
                    <i className="fas fa-play"></i>
                </div>
            </div>
            <div className="track-card__info">
                <h3 className="track-card__title">{track.title}</h3>
                <p className="track-card__artist">{track.artist}</p>
            </div>
        </div>
    );
}

export default TrackCard;
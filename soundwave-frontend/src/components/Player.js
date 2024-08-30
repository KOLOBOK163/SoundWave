import React from 'react';
import './Player.css';

function Player() {
  return (
    <div className="player">
      <div className="player__left">
        <img
          src="https://i.scdn.co/image/ab67616d0000b273b7f2f4d0c7f6d43a7e5eb44e"
          alt="Track"
          className="player__album"
        />
        <div className="player__info">
          <h4 className="player__title">Название трека</h4>
          <p className="player__artist">Имя исполнителя</p>
        </div>
      </div>
      <div className="player__center">
        <button className="player__button">Назад</button>
        <button className="player__button">Пауза</button>
        <button className="player__button">Вперед</button>
      </div>
      <div className="player__right">
        <p className="player__volume">Громкость</p>
      </div>
    </div>
  );
}

export default Player;

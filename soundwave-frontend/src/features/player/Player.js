import React, { useState, useEffect, useRef } from 'react';
import './Player.css';

function Player() {
  // Состояние плеера
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.7);
  const [isRepeat, setIsRepeat] = useState(false);

  // Рефы
  const audioElementRef = useRef(new Audio());
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const sourceCreatedRef = useRef(false); // Флаг для отслеживания создания источника
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const progressBarRef = useRef(null);

  // Инициализация Web Audio API
  useEffect(() => {
    // Создаем аудио контекст только один раз при монтировании
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContext();
    
    // Настройка узлов Web Audio API
    gainNodeRef.current = audioContextRef.current.createGain();
    analyserNodeRef.current = audioContextRef.current.createAnalyser();
    analyserNodeRef.current.fftSize = 256;
    
    // Подключаем цепочку обработки
    gainNodeRef.current.connect(analyserNodeRef.current);
    analyserNodeRef.current.connect(audioContextRef.current.destination);
    
    // Настройка громкости
    gainNodeRef.current.gain.value = volume;
    
    return () => {
      // Остановка анимации и закрытие аудиоконтекста при размонтировании
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []); // Пустой массив зависимостей для выполнения только при монтировании

  // Настройка обработчиков событий аудиоэлемента
  useEffect(() => {
    const audioElement = audioElementRef.current;
    
    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
      setProgress((audioElement.currentTime / audioElement.duration) * 100 || 0);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    };
    
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);
    
    return () => {
      // Очистка слушателей
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, []); // Выполняется только при монтировании

  // Обработчик для воспроизведения треков из других компонентов
  useEffect(() => {
    const handlePlayTrack = (event) => {
      const track = event.detail;
      const audioElement = audioElementRef.current;
      
      // Останавливаем текущее воспроизведение
      audioElement.pause();
      
      // Устанавливаем новый трек в состояние
      setCurrentTrack(track);
      
      // Устанавливаем источник аудио
      audioElement.src = `http://localhost:8080${track.fileUrl}`;
      audioElement.crossOrigin = "anonymous"; // Важно для CORS
      audioElement.load();
      
      // Обновляем подключение к Web Audio API
      if (sourceCreatedRef.current) {
        // Если аудиоконтекст уже создан и подкючен к элементу,
        // не создаем новый источник
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } else {
        // Первое подключение элемента к аудиоконтексту
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        const source = audioContextRef.current.createMediaElementSource(audioElement);
        source.connect(gainNodeRef.current);
        sourceCreatedRef.current = true; // Отмечаем, что источник создан
      }
      
      // Воспроизводим аудио
      audioElement.play()
        .then(() => {
          setIsPlaying(true);
          startVisualization();
          
          // Регистрируем прослушивание
          if (track.id) {
            const token = localStorage.getItem('token');
            if (token) {
              fetch(`http://localhost:8080/api/tracks/${track.id}/play`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
              }).catch(err => console.error('Failed to record play:', err));
            }
          }
        })
        .catch(error => {
          console.error('Error playing audio:', error);
        });
    };
    
    window.addEventListener('playTrack', handlePlayTrack);
    
    return () => {
      window.removeEventListener('playTrack', handlePlayTrack);
    };
  }, []); // Независимо от isPlaying

  // Обработчик изменения громкости
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audioElement = audioElementRef.current;
    
    const handleEnded = () => {
      if (isRepeat) {
        // Если включен режим повтора, перематываем на начало и продолжаем воспроизведение
        audioElement.currentTime = 0;
        audioElement.play()
          .then(() => {
            // Продолжаем визуализацию, если она была остановлена
            if (!animationFrameRef.current) {
              startVisualization();
            }
          })
          .catch(error => {
            console.error('Error restarting audio:', error);
            setIsPlaying(false);
          });
      } else {
        // Если режим повтора выключен, останавливаем воспроизведение
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
      }
    };
    
    audioElement.addEventListener('ended', handleEnded);
    
    return () => {
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat]);

  const toggleRepeat = () => {
    setIsRepeat(prevState => !prevState);
  };

  // Функция для визуализации
  const startVisualization = () => {
    if (!canvasRef.current || !analyserNodeRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserNodeRef.current;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const width = canvas.width;
    const height = canvas.height;
    
    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, width, height);
      
      // Создаем градиент
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1DB954');
      gradient.addColorStop(0.5, '#1DB954');
      gradient.addColorStop(1, '#191414');
      
      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.8;
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    renderFrame();
  };

  // Обработчики пользовательского ввода
  const handlePlayPause = () => {
    if (!currentTrack) return;
    
    const audioElement = audioElementRef.current;
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    } else {
      audioElement.play()
        .then(() => {
          setIsPlaying(true);
          startVisualization();
        })
        .catch(error => {
          console.error('Error playing audio:', error);
        });
    }
  };

  const handlePrevious = () => {
    const audioElement = audioElementRef.current;
    if (audioElement.currentTime > 3) {
      audioElement.currentTime = 0;
    } else {
      console.log('Go to previous track');
    }
  };

  const handleNext = () => {
    console.log('Go to next track');
  };

  const handleSeek = (e) => {
    if (!currentTrack) return;
    
    const audioElement = audioElementRef.current;
    const progressBar = progressBarRef.current;
    
    const rect = progressBar.getBoundingClientRect();
    const clickPositionRatio = (e.clientX - rect.left) / rect.width;
    const newTime = clickPositionRatio * audioElement.duration;
    
    audioElement.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(clickPositionRatio * 100);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    setPrevVolume(newVolume > 0 ? newVolume : prevVolume);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  // Форматирование времени
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <span>🔇</span>;
    } else if (volume < 0.5) {
      return <span>🔉</span>;
    } else {
      return <span>🔊</span>;
    }
  };

  return (
    <div className="player">
      {/* Левая часть: информация о треке */}
      <div className="player__left">
        {currentTrack ? (
          <>
            <div className="player__thumbnail">
              <img
                src={currentTrack.coverUrl ? `http://localhost:8080${currentTrack.coverUrl}` : 'https://via.placeholder.com/60'}
                alt={currentTrack.title}
                className="player__album"
                crossOrigin="anonymous"
              />
            </div>
            <div className="player__info">
              <div className="player__title">{currentTrack.title}</div>
              <div className="player__artist">{currentTrack.artist}</div>
            </div>
          </>
        ) : (
          <div className="player__info">
            <div className="player__title">Выберите трек</div>
            <div className="player__artist">SoundWave</div>
          </div>
        )}
      </div>

      {/* Центральная часть: управление и прогресс */}
      <div className="player__center">
        {/* Кнопки управления */}
        <div className="player__controls">
          <button className="player__button player__button--control" onClick={handlePrevious} title="Предыдущий трек">
            <span>⏮</span>
          </button>
          
          <button 
            className={`player__button player__button--play ${isPlaying ? 'is-playing' : ''}`} 
            onClick={handlePlayPause}
            title={isPlaying ? "Пауза" : "Воспроизвести"}
          >
            <span>{isPlaying ? "⏸" : "▶"}</span>
          </button>
          
          <button className="player__button player__button--control" onClick={handleNext} title="Следующий трек">
            <span>⏭</span>
          </button>

          <button 
            className={`player__button player__button--repeat ${isRepeat ? 'active' : ''}`}
            onClick={toggleRepeat}
            title={isRepeat ? "Выключить повтор" : "Включить повтор"}
          >
            <span>🔁</span>
          </button>
        </div>

        {/* Прогресс и время */}
        <div className="player__timeline">
          <span className="player__time">{formatTime(currentTime)}</span>
          
          <div 
            className="player__progress-container" 
            onClick={handleSeek}
            ref={progressBarRef}
          >
            <div className="player__progress-background"></div>
            <div 
              className="player__progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
            <div 
              className="player__progress-handle" 
              style={{ left: `${progress}%` }}
            ></div>
          </div>
          
          <span className="player__time">{formatTime(duration)}</span>
        </div>

        {/* Визуализация аудио */}
        <div className="player__visualization">
          <canvas ref={canvasRef} height="30" width="400"></canvas>
        </div>
      </div>

      {/* Правая часть: громкость */}
      <div className="player__right">
        <div className="player__volume">
          <button 
            className="player__button player__button--volume" 
            onClick={toggleMute}
            title={isMuted ? "Включить звук" : "Выключить звук"}
          >
            {renderVolumeIcon()}
          </button>
          
          <div className="player__volume-slider-container">
            <div className="player__volume-slider-bg"></div>
            <div 
              className="player__volume-slider-fill"
              style={{ width: `${volume * 100}%` }}
            ></div>
            <input
              type="range"
              className="player__volume-slider"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              title="Громкость"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;